package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/internal/utils"
	"nexa/backend/prisma/db"
	"time"

	"github.com/go-chi/chi/v5"
)

type CreateOrderRequest struct {
	ProductID       string  `json:"product_id"`
	Quantity        int     `json:"quantity"`
	Amount          float64 `json:"amount"`
	ShippingAddress string  `json:"shipping_address"`
	Phone           string  `json:"phone"`
}

// CreateOrder handles order creation and sends order SMS + Email notifications to both client and seller
func CreateOrder(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	var req CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	// Create the order using correct Prisma Go positional args: Client, Product, Amount
	order, err := internalDB.Client.Order.CreateOne(
		db.Order.Client.Link(db.User.ID.Equals(userID)),
		db.Order.Product.Link(db.Product.ID.Equals(req.ProductID)),
		db.Order.Amount.Set(req.Amount),
		db.Order.Quantity.Set(req.Quantity),
		db.Order.Status.Set("PAID"), // Set to PAID after checkout payment
		db.Order.ShippingAddress.Set(req.ShippingAddress),
		db.Order.Phone.Set(req.Phone),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error creating order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Automatically create a Delivery entry
	_, err = internalDB.Client.Delivery.CreateOne(
		db.Delivery.Order.Link(db.Order.ID.Equals(order.ID)),
		db.Delivery.Status.Set("PENDING"),
	).Exec(ctx)
	if err != nil {
		log.Printf("Warning: Failed to create Delivery record for order %s: %v", order.ID, err)
	}

	// Fetch Order with details to send SMS + Email
	orderWithDetails, err := internalDB.Client.Order.FindUnique(
		db.Order.ID.Equals(order.ID),
	).With(
		db.Order.Client.Fetch(),
		db.Order.Product.Fetch().With(db.Product.ProProfile.Fetch().With(db.ProProfile.User.Fetch())),
	).Exec(ctx)

	if err == nil {
		proProfile := orderWithDetails.Product().ProProfile()
		phone, hasPhone := proProfile.Phone()
		productName := orderWithDetails.Product().Name
		qty := orderWithDetails.Quantity
		totalAmt := orderWithDetails.Amount

		msg := fmt.Sprintf("Hello! You have a new Nexa order for '%s' (Qty: %d). Total Amount: ₦%.2f. Delivery Address: %s. Log in to fulfill.", productName, qty, totalAmt, req.ShippingAddress)
		clientMsg := fmt.Sprintf("Your order for '%s' (Qty: %d) has been placed successfully. Total: ₦%.2f.", productName, qty, totalAmt)

		// Mirror to notifications
		_ = utils.CreateNotification(proProfile.UserID, "New Order Received", msg, "ORDER")
		_ = utils.CreateNotification(userID, "Order Placed", clientMsg, "ORDER")

		// Send SMS to Pro if available
		if hasPhone && phone != "" {
			go func() {
				if err := utils.SendSMS(phone, msg); err != nil {
					log.Printf("Error sending new order SMS: %v", err)
				}
			}()
		}

		// Send Email to Pro and Client
		clientEmail := orderWithDetails.Client().Email
		proEmail := ""
		if bEmail, ok := proProfile.BusinessEmail(); ok && bEmail != "" {
			proEmail = bEmail
		} else if proUser := proProfile.User(); proUser != nil {
			proEmail = proUser.Email
		}

		utils.SendBookingEmailHelper(clientEmail, proEmail, "New Order Received - Nexa", msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// ListMyOrders lists orders for clients or sellers (Pros)
func ListMyOrders(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	role := r.Context().Value(middleware.RoleKey).(string)
	ctx := context.Background()

	var orders []db.OrderModel
	var err error

	if role == "PRO" {
		profile, err := internalDB.Client.ProProfile.FindUnique(
			db.ProProfile.UserID.Equals(userID),
		).Exec(ctx)

		if err != nil || profile == nil {
			http.Error(w, "pro profile not found", http.StatusNotFound)
			return
		}

		orders, err = internalDB.Client.Order.FindMany(
			db.Order.Product.Where(db.Product.ProProfileID.Equals(profile.ID)),
		).With(
			db.Order.Product.Fetch(),
			db.Order.Client.Fetch(),
			db.Order.Delivery.Fetch(),
		).Exec(ctx)
	} else {
		orders, err = internalDB.Client.Order.FindMany(
			db.Order.ClientID.Equals(userID),
		).With(
			db.Order.Product.Fetch().With(db.Product.ProProfile.Fetch()),
			db.Order.Delivery.Fetch(),
		).Exec(ctx)
	}

	if err != nil {
		http.Error(w, "error fetching orders: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// GetOrder fetches order details
func GetOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := context.Background()

	order, err := internalDB.Client.Order.FindUnique(
		db.Order.ID.Equals(id),
	).With(
		db.Order.Client.Fetch(),
		db.Order.Product.Fetch().With(db.Product.ProProfile.Fetch()),
		db.Order.Delivery.Fetch(),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "order not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// UpdateOrderStatus updates order status (e.g. PAID, CANCELLED)
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := context.Background()

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	order, err := internalDB.Client.Order.FindUnique(
		db.Order.ID.Equals(id),
	).Update(
		db.Order.Status.Set(req.Status),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error updating order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send cancellation notification if cancelled
	if req.Status == "CANCELLED" {
		orderWithDetails, err := internalDB.Client.Order.FindUnique(
			db.Order.ID.Equals(order.ID),
		).With(
			db.Order.Client.Fetch(),
			db.Order.Product.Fetch().With(db.Product.ProProfile.Fetch().With(db.ProProfile.User.Fetch())),
		).Exec(ctx)

		if err == nil {
			proProfile := orderWithDetails.Product().ProProfile()
			phone, hasPhone := proProfile.Phone()
			msg := fmt.Sprintf("Your Nexa order for '%s' (Order ID: %s) has been cancelled.", orderWithDetails.Product().Name, order.ID)

			// Mirror to notifications
			_ = utils.CreateNotification(proProfile.UserID, "Order Cancelled", msg, "ORDER")
			_ = utils.CreateNotification(orderWithDetails.ClientID, "Order Cancelled", msg, "ORDER")

			if hasPhone && phone != "" {
				go func() {
					if err := utils.SendSMS(phone, msg); err != nil {
						log.Printf("Error sending cancelled order SMS: %v", err)
					}
				}()
			}

			clientEmail := orderWithDetails.Client().Email
			proEmail := ""
			if bEmail, ok := proProfile.BusinessEmail(); ok && bEmail != "" {
				proEmail = bEmail
			} else if proUser := proProfile.User(); proUser != nil {
				proEmail = proUser.Email
			}

			utils.SendBookingEmailHelper(clientEmail, proEmail, "Order Cancelled - Nexa", msg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

type UpdateDeliveryStatusRequest struct {
	Status            string    `json:"status"`
	TrackingNumber    string    `json:"tracking_number,omitempty"`
	Carrier           string    `json:"carrier,omitempty"`
	EstimatedDelivery time.Time `json:"estimated_delivery,omitempty"`
}

// UpdateDeliveryStatus updates delivery tracking status and dispatches delivery SMS + Email notifications to the client
func UpdateDeliveryStatus(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "orderId")
	ctx := context.Background()

	var req UpdateDeliveryStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Find the existing delivery
	existingDelivery, err := internalDB.Client.Delivery.FindUnique(
		db.Delivery.OrderID.Equals(orderID),
	).Exec(ctx)

	if err != nil || existingDelivery == nil {
		http.Error(w, "delivery record not found", http.StatusNotFound)
		return
	}

	// Update delivery status using db.DeliverySetParam slice to support optional updates conditionally
	params := []db.DeliverySetParam{
		db.Delivery.Status.Set(req.Status),
	}

	if req.TrackingNumber != "" {
		params = append(params, db.Delivery.TrackingNumber.Set(req.TrackingNumber))
	}
	if req.Carrier != "" {
		params = append(params, db.Delivery.Carrier.Set(req.Carrier))
	}
	if !req.EstimatedDelivery.IsZero() {
		params = append(params, db.Delivery.EstimatedDelivery.Set(req.EstimatedDelivery))
	}

	delivery, err := internalDB.Client.Delivery.FindUnique(
		db.Delivery.OrderID.Equals(orderID),
	).Update(
		params...,
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error updating delivery: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch Order details to send notifications to client's phone and email
	order, err := internalDB.Client.Order.FindUnique(
		db.Order.ID.Equals(orderID),
	).With(
		db.Order.Client.Fetch(),
		db.Order.Product.Fetch(),
	).Exec(ctx)

	if err == nil {
		productName := order.Product().Name
		var msg string

		carrierName := req.Carrier
		if carrierName == "" {
			if c, ok := delivery.Carrier(); ok && c != "" {
				carrierName = c
			} else {
				carrierName = "our delivery partner"
			}
		}

		trackNum := req.TrackingNumber
		if trackNum == "" {
			if t, ok := delivery.TrackingNumber(); ok {
				trackNum = t
			}
		}

		switch req.Status {
		case "SHIPPED":
			msg = fmt.Sprintf("Your Nexa order for '%s' has been shipped via %s. Tracking number: %s.", productName, carrierName, trackNum)
		case "OUT_FOR_DELIVERY":
			msg = fmt.Sprintf("Your Nexa order for '%s' is out for delivery! Get ready to receive it.", productName)
		case "DELIVERED":
			msg = fmt.Sprintf("Your Nexa order for '%s' has been successfully delivered. Thank you for shopping on Nexa!", productName)
		}

		if msg != "" {
			// Mirror to notifications
			_ = utils.CreateNotification(order.ClientID, "Delivery Update", msg, "DELIVERY")

			// Send SMS to client
			if phone, ok := order.Phone(); ok && phone != "" {
				go func() {
					if err := utils.SendSMS(phone, msg); err != nil {
						log.Printf("Error sending delivery SMS: %v", err)
					}
				}()
			}

			// Send Email to client
			clientEmail := order.Client().Email
			go func() {
				_ = utils.SendEmail(clientEmail, "Delivery Update - Nexa", msg)
			}()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delivery)
}

// GetDelivery fetches delivery details for a specific order
func GetDelivery(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "orderId")
	ctx := context.Background()

	delivery, err := internalDB.Client.Delivery.FindUnique(
		db.Delivery.OrderID.Equals(orderID),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "delivery not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delivery)
}

// TriggerBookingReminders scans confirmed bookings in the next 24 hours and dispatches SMS + Email reminders
func TriggerBookingReminders(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	now := time.Now()
	tomorrow := now.Add(24 * time.Hour)

	// Fetch confirmed bookings scheduled between now and 24 hours later
	bookings, err := internalDB.Client.Booking.FindMany(
		db.Booking.ScheduledAt.Gte(now),
		db.Booking.ScheduledAt.Lte(tomorrow),
		db.Booking.Status.Equals("CONFIRMED"),
	).With(
		db.Booking.Client.Fetch(),
		db.Booking.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error fetching bookings for reminders: "+err.Error(), http.StatusInternalServerError)
		return
	}

	remindersSent := 0
	for _, booking := range bookings {
		proProfile := booking.ProProfile()
		phone, ok := proProfile.Phone()

		clientName := "A client"
		if uName, ok := booking.Client().Name(); ok && uName != "" {
			clientName = uName
		}
		serviceName := "Service"
		if sName, ok := booking.ServiceName(); ok && sName != "" {
			serviceName = sName
		}
		scheduledTime := booking.ScheduledAt.Format("Jan 02 at 3:04 PM")

		msg := fmt.Sprintf("Nexa Reminder: You have an upcoming booking for '%s' with client %s scheduled for %s. Get ready!", serviceName, clientName, scheduledTime)

		proName := "Pro"
		if bName, ok := proProfile.BusinessName(); ok && bName != "" {
			proName = bName
		} else if proUser := proProfile.User(); proUser != nil {
			if name, ok := proUser.Name(); ok && name != "" {
				proName = name
			}
		}
		clientMsg := fmt.Sprintf("Nexa Reminder: You have an upcoming booking for '%s' with %s scheduled for %s.", serviceName, proName, scheduledTime)

		// Mirror to notifications
		_ = utils.CreateNotification(proProfile.UserID, "Upcoming Booking Reminder", msg, "BOOKING")
		_ = utils.CreateNotification(booking.ClientID, "Upcoming Booking Reminder", clientMsg, "BOOKING")

		// Send SMS to Pro
		if ok && phone != "" {
			go func(phoneNumber, message string) {
				if err := utils.SendSMS(phoneNumber, message); err != nil {
					log.Printf("Error sending booking reminder SMS to %s: %v", phoneNumber, err)
				}
			}(phone, msg)
		}

		// Send Email to Pro and Client
		clientEmail := booking.Client().Email
		proEmail := ""
		if bEmail, ok := proProfile.BusinessEmail(); ok && bEmail != "" {
			proEmail = bEmail
		} else if proUser := proProfile.User(); proUser != nil {
			proEmail = proUser.Email
		}

		utils.SendBookingEmailHelper(clientEmail, proEmail, "Upcoming Booking Reminder - Nexa", msg)

		remindersSent++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"reminders_sent": remindersSent,
	})
}
