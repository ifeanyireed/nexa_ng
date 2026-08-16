package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	internalDB "nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/middleware"
	"nexa/marketplace_service/internal/models"
	"nexa/marketplace_service/internal/utils"
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	order := models.Order{
		ClientID:        userID,
		ProductID:       req.ProductID,
		Amount:          req.Amount,
		Quantity:        req.Quantity,
		Status:          "PAID",
		ShippingAddress: req.ShippingAddress,
		Phone:           req.Phone,
	}

	if err := internalDB.DB.Create(&order).Error; err != nil {
		http.Error(w, "error creating order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Automatically create a Delivery entry
	delivery := models.Delivery{
		OrderID: order.ID,
		Status:  "PENDING",
	}
	if err := internalDB.DB.Create(&delivery).Error; err != nil {
		log.Printf("Warning: Failed to create Delivery record for order %s: %v", order.ID, err)
	}

	// Fetch Order with details to send SMS + Email
	var orderWithDetails models.Order
	err := internalDB.DB.Preload("Client").
		Preload("Product").
		Preload("Product.ProProfile").
		Preload("Product.ProProfile.User").
		Where("id = ?", order.ID).
		First(&orderWithDetails).Error

	if err == nil && orderWithDetails.Product != nil && orderWithDetails.Product.ProProfile != nil {
		proProfile := orderWithDetails.Product.ProProfile
		phone := proProfile.Phone
		productName := orderWithDetails.Product.Name
		qty := orderWithDetails.Quantity
		totalAmt := orderWithDetails.Amount

		msg := fmt.Sprintf("Hello! You have a new Nexa order for '%s' (Qty: %d). Total Amount: ₦%.2f. Delivery Address: %s. Log in to fulfill.", productName, qty, totalAmt, req.ShippingAddress)
		clientMsg := fmt.Sprintf("Your order for '%s' (Qty: %d) has been placed successfully. Total: ₦%.2f.", productName, qty, totalAmt)

		_ = utils.CreateNotification(proProfile.UserID, "New Order Received", msg, "ORDER")
		_ = utils.CreateNotification(userID, "Order Placed", clientMsg, "ORDER")

		if phone != "" {
			go func() {
				if err := utils.SendSMS(phone, msg); err != nil {
					log.Printf("Error sending new order SMS: %v", err)
				}
			}()
		}

		clientEmail := ""
		if orderWithDetails.Client != nil {
			clientEmail = orderWithDetails.Client.Email
		}
		proEmail := ""
		if proProfile.BusinessEmail != "" {
			proEmail = proProfile.BusinessEmail
		} else if proProfile.User != nil {
			proEmail = proProfile.User.Email
		}

		utils.SendBookingEmailHelper(clientEmail, proEmail, "New Order Received - Nexa", msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// ListMyOrders lists orders for clients or sellers (Pros)
func ListMyOrders(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)
	role := r.Context().Value(middleware.RoleKey).(string)

	var orders []models.Order
	var err error

	if role == "PRO" {
		var profile models.ProProfile
		if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
			http.Error(w, "pro profile not found", http.StatusNotFound)
			return
		}

		err = internalDB.DB.Preload("Product").
			Preload("Client").
			Preload("Delivery").
			Joins("JOIN `Product` on `Product`.id = `Order`.product_id").
			Where("`Product`.pro_profile_id = ?", profile.ID).
			Order("`Order`.created_at desc").
			Find(&orders).Error
	} else {
		err = internalDB.DB.Preload("Product").
			Preload("Product.ProProfile").
			Preload("Delivery").
			Where("client_id = ?", userID).
			Order("created_at desc").
			Find(&orders).Error
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var order models.Order
	err := internalDB.DB.Preload("Client").
		Preload("Product").
		Preload("Product.ProProfile").
		Preload("Delivery").
		Where("id = ?", id).
		First(&order).Error

	if err != nil {
		http.Error(w, "order not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// UpdateOrderStatus updates order status (e.g. PAID, CANCELLED)
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var order models.Order
	if err := internalDB.DB.Where("id = ?", id).First(&order).Error; err != nil {
		http.Error(w, "order not found", http.StatusNotFound)
		return
	}

	order.Status = req.Status
	if err := internalDB.DB.Save(&order).Error; err != nil {
		http.Error(w, "error updating order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if req.Status == "CANCELLED" {
		var orderWithDetails models.Order
		err := internalDB.DB.Preload("Client").
			Preload("Product").
			Preload("Product.ProProfile").
			Preload("Product.ProProfile.User").
			Where("id = ?", order.ID).
			First(&orderWithDetails).Error

		if err == nil && orderWithDetails.Product != nil && orderWithDetails.Product.ProProfile != nil {
			proProfile := orderWithDetails.Product.ProProfile
			phone := proProfile.Phone
			msg := fmt.Sprintf("Your Nexa order for '%s' (Order ID: %s) has been cancelled.", orderWithDetails.Product.Name, order.ID)

			_ = utils.CreateNotification(proProfile.UserID, "Order Cancelled", msg, "ORDER")
			_ = utils.CreateNotification(orderWithDetails.ClientID, "Order Cancelled", msg, "ORDER")

			if phone != "" {
				go func() {
					if err := utils.SendSMS(phone, msg); err != nil {
						log.Printf("Error sending cancelled order SMS: %v", err)
					}
				}()
			}

			clientEmail := ""
			if orderWithDetails.Client != nil {
				clientEmail = orderWithDetails.Client.Email
			}
			proEmail := ""
			if proProfile.BusinessEmail != "" {
				proEmail = proProfile.BusinessEmail
			} else if proProfile.User != nil {
				proEmail = proProfile.User.Email
			}

			utils.SendBookingEmailHelper(clientEmail, proEmail, "Order Cancelled - Nexa", msg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

type UpdateDeliveryStatusRequest struct {
	Status            string     `json:"status"`
	TrackingNumber    string     `json:"tracking_number,omitempty"`
	Carrier           string     `json:"carrier,omitempty"`
	EstimatedDelivery *time.Time `json:"estimated_delivery,omitempty"`
}

// UpdateDeliveryStatus updates delivery tracking status and dispatches delivery SMS + Email notifications to the client
func UpdateDeliveryStatus(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	orderID := chi.URLParam(r, "orderId")

	var req UpdateDeliveryStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var delivery models.Delivery
	if err := internalDB.DB.Where("order_id = ?", orderID).First(&delivery).Error; err != nil {
		http.Error(w, "delivery record not found", http.StatusNotFound)
		return
	}

	delivery.Status = req.Status
	if req.TrackingNumber != "" {
		delivery.TrackingNumber = req.TrackingNumber
	}
	if req.Carrier != "" {
		delivery.Carrier = req.Carrier
	}
	if req.EstimatedDelivery != nil {
		delivery.EstimatedDelivery = req.EstimatedDelivery
	}

	if err := internalDB.DB.Save(&delivery).Error; err != nil {
		http.Error(w, "error updating delivery: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var order models.Order
	err := internalDB.DB.Preload("Client").
		Preload("Product").
		Where("id = ?", orderID).
		First(&order).Error

	if err == nil && order.Product != nil {
		productName := order.Product.Name
		carrierName := req.Carrier
		if carrierName == "" {
			carrierName = delivery.Carrier
		}
		if carrierName == "" {
			carrierName = "our delivery partner"
		}

		trackNum := req.TrackingNumber
		if trackNum == "" {
			trackNum = delivery.TrackingNumber
		}

		var msg string
		switch req.Status {
		case "SHIPPED":
			msg = fmt.Sprintf("Your Nexa order for '%s' has been shipped via %s. Tracking number: %s.", productName, carrierName, trackNum)
		case "OUT_FOR_DELIVERY":
			msg = fmt.Sprintf("Your Nexa order for '%s' is out for delivery! Get ready to receive it.", productName)
		case "DELIVERED":
			msg = fmt.Sprintf("Your Nexa order for '%s' has been successfully delivered. Thank you for shopping on Nexa!", productName)
		}

		if msg != "" {
			_ = utils.CreateNotification(order.ClientID, "Delivery Update", msg, "DELIVERY")
			if order.Phone != "" {
				go func() {
					if err := utils.SendSMS(order.Phone, msg); err != nil {
						log.Printf("Error sending delivery SMS: %v", err)
					}
				}()
			}
			if order.Client != nil && order.Client.Email != "" {
				go func() {
					_ = utils.SendEmail(order.Client.Email, "Delivery Update - Nexa", msg)
				}()
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delivery)
}

// GetDelivery fetches delivery details for a specific order
func GetDelivery(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	orderID := chi.URLParam(r, "orderId")

	var delivery models.Delivery
	if err := internalDB.DB.Where("order_id = ?", orderID).First(&delivery).Error; err != nil {
		http.Error(w, "delivery not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delivery)
}

// TriggerBookingReminders scans confirmed bookings in the next 24 hours and dispatches SMS + Email reminders
func TriggerBookingReminders(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	now := time.Now()
	tomorrow := now.Add(24 * time.Hour)

	var bookings []models.Booking
	err := internalDB.DB.Preload("Client").
		Preload("ProProfile").
		Preload("ProProfile.User").
		Where("scheduled_at >= ? AND scheduled_at <= ? AND status = ?", now, tomorrow, "CONFIRMED").
		Find(&bookings).Error

	if err != nil {
		http.Error(w, "error fetching bookings for reminders: "+err.Error(), http.StatusInternalServerError)
		return
	}

	remindersSent := 0
	for _, booking := range bookings {
		proProfile := booking.ProProfile
		clientName := "A client"
		if booking.Client != nil && booking.Client.Name != "" {
			clientName = booking.Client.Name
		}
		serviceName := booking.ServiceName
		if serviceName == "" {
			serviceName = "Service"
		}
		scheduledTime := booking.ScheduledAt.Format("Jan 02 at 3:04 PM")

		msg := fmt.Sprintf("Nexa Reminder: You have an upcoming booking for '%s' with client %s scheduled for %s. Get ready!", serviceName, clientName, scheduledTime)

		proName := "Pro"
		if proProfile != nil && proProfile.BusinessName != "" {
			proName = proProfile.BusinessName
		} else if proProfile != nil && proProfile.User != nil && proProfile.User.Name != "" {
			proName = proProfile.User.Name
		}
		clientMsg := fmt.Sprintf("Nexa Reminder: You have an upcoming booking for '%s' with %s scheduled for %s.", serviceName, proName, scheduledTime)

		if proProfile != nil {
			_ = utils.CreateNotification(proProfile.UserID, "Upcoming Booking Reminder", msg, "BOOKING")
			if proProfile.Phone != "" {
				go func(phoneNumber, message string) {
					if err := utils.SendSMS(phoneNumber, message); err != nil {
						log.Printf("Error sending booking reminder SMS to %s: %v", phoneNumber, err)
					}
				}(proProfile.Phone, msg)
			}
		}
		_ = utils.CreateNotification(booking.ClientID, "Upcoming Booking Reminder", clientMsg, "BOOKING")

		clientEmail := ""
		if booking.Client != nil {
			clientEmail = booking.Client.Email
		}
		proEmail := ""
		if proProfile != nil {
			if proProfile.BusinessEmail != "" {
				proEmail = proProfile.BusinessEmail
			} else if proProfile.User != nil {
				proEmail = proProfile.User.Email
			}
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
