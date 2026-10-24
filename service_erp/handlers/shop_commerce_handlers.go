package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

// ShopOrderItem represents an item in an omnichannel customer order
type ShopOrderItem struct {
	ID        string         `json:"id"`
	ProductID string         `json:"productId"`
	Title     string         `json:"title"`
	Price     float64        `json:"price"`
	Quantity  int            `json:"quantity"`
	ImageURL  string         `json:"imageUrl,omitempty"`
	Options   map[string]any `json:"options,omitempty"`
}

// ShopOrder represents an order placed via storefront, POS, or sales reps
type ShopOrder struct {
	ID              string          `json:"id"`
	OrderNumber     string          `json:"orderNumber"`
	TenantSlug      string          `json:"tenantSlug"`
	TenantID        string          `json:"tenantId,omitempty"`
	CustomerName    string          `json:"customerName"`
	CustomerEmail   string          `json:"customerEmail"`
	CustomerPhone   string          `json:"customerPhone"`
	Channel         string          `json:"channel"`
	Status          string          `json:"status"`
	PaymentStatus   string          `json:"paymentStatus"`
	DeliveryMethod  string          `json:"deliveryMethod"`
	ShippingAddress string          `json:"shippingAddress"`
	City            string          `json:"city"`
	PaymentMethod   string          `json:"paymentMethod"`
	ItemsSummary    string          `json:"itemsSummary"`
	ItemCount       int             `json:"itemCount"`
	TotalAmount     string          `json:"totalAmount"`
	RawAmount       float64         `json:"rawAmount"`
	Currency        string          `json:"currency"`
	Items           []ShopOrderItem `json:"items"`
	Notes           string          `json:"notes,omitempty"`
	CreatedAt       string          `json:"createdAt"`
	UpdatedAt       string          `json:"updatedAt"`
}

// ShopBooking represents an appointment or inspection service booked by a customer
type ShopBooking struct {
	ID            string  `json:"id"`
	BookingNumber string  `json:"bookingNumber"`
	TenantSlug    string  `json:"tenantSlug"`
	TenantID      string  `json:"tenantId,omitempty"`
	CustomerName  string  `json:"customerName"`
	CustomerEmail string  `json:"customerEmail"`
	CustomerPhone string  `json:"customerPhone"`
	ServiceTitle  string  `json:"serviceTitle"`
	DateTime      string  `json:"dateTime"`
	Status        string  `json:"status"`
	Vertical      string  `json:"vertical"`
	Notes         string  `json:"notes,omitempty"`
	Amount        float64 `json:"amount,omitempty"`
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

// HandleShopOrders handles GET (list), POST (create), and PATCH (status transition) for shop orders
func HandleShopOrders(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
		channelFilter := strings.TrimSpace(r.URL.Query().Get("channel"))

		query := `
			SELECT id, order_number, tenant_slug, COALESCE(tenant_id, ''), customer_name,
			       COALESCE(customer_email, ''), customer_phone, channel, status,
			       payment_status, delivery_method, COALESCE(shipping_address, ''),
			       COALESCE(city, 'Lagos'), COALESCE(payment_method, 'card'),
			       COALESCE(items_summary, ''), item_count, total_amount, raw_amount,
			       COALESCE(currency, '₦'), COALESCE(items::text, '[]'), COALESCE(notes, ''),
			       created_at, updated_at
			FROM shop_orders
			WHERE LOWER(tenant_slug) = $1`

		args := []any{slug}
		argIdx := 2

		if statusFilter != "" && !strings.EqualFold(statusFilter, "ALL") {
			query += fmt.Sprintf(" AND status = $%d", argIdx)
			args = append(args, statusFilter)
			argIdx++
		}

		if channelFilter != "" && !strings.EqualFold(channelFilter, "ALL") {
			query += fmt.Sprintf(" AND channel = $%d", argIdx)
			args = append(args, channelFilter)
			argIdx++
		}

		query += " ORDER BY created_at DESC LIMIT 100"

		rows, err := targetDB.Query(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch orders: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		orders := make([]ShopOrder, 0)
		for rows.Next() {
			var o ShopOrder
			var itemsJSON string
			var createdAt, updatedAt time.Time

			err := rows.Scan(
				&o.ID, &o.OrderNumber, &o.TenantSlug, &o.TenantID, &o.CustomerName,
				&o.CustomerEmail, &o.CustomerPhone, &o.Channel, &o.Status,
				&o.PaymentStatus, &o.DeliveryMethod, &o.ShippingAddress,
				&o.City, &o.PaymentMethod, &o.ItemsSummary, &o.ItemCount,
				&o.TotalAmount, &o.RawAmount, &o.Currency, &itemsJSON, &o.Notes,
				&createdAt, &updatedAt,
			)
			if err != nil {
				continue
			}

			o.CreatedAt = createdAt.Format(time.RFC3339)
			o.UpdatedAt = updatedAt.Format(time.RFC3339)
			o.Items = make([]ShopOrderItem, 0)
			_ = json.Unmarshal([]byte(itemsJSON), &o.Items)

			orders = append(orders, o)
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"count":   len(orders),
			"orders":  orders,
		})

	case http.MethodPost:
		var payload struct {
			ID              string          `json:"id"`
			OrderNumber     string          `json:"orderNumber"`
			TenantSlug      string          `json:"tenantSlug"`
			TenantID        string          `json:"tenantId"`
			CustomerName    string          `json:"customerName"`
			CustomerEmail   string          `json:"customerEmail"`
			CustomerPhone   string          `json:"customerPhone"`
			Channel         string          `json:"channel"`
			Status          string          `json:"status"`
			PaymentStatus   string          `json:"paymentStatus"`
			DeliveryMethod  string          `json:"deliveryMethod"`
			ShippingAddress string          `json:"shippingAddress"`
			City            string          `json:"city"`
			PaymentMethod   string          `json:"paymentMethod"`
			ItemsSummary    string          `json:"itemsSummary"`
			ItemCount       int             `json:"itemCount"`
			TotalAmount     string          `json:"totalAmount"`
			RawAmount       float64         `json:"rawAmount"`
			Currency        string          `json:"currency"`
			Items           []ShopOrderItem `json:"items"`
			Notes           string          `json:"notes"`
		}

		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(payload.CustomerName) == "" || strings.TrimSpace(payload.CustomerPhone) == "" {
			http.Error(w, `{"error": "Customer name and phone number are required"}`, http.StatusBadRequest)
			return
		}

		if payload.TenantSlug != "" {
			slug = strings.ToLower(strings.TrimSpace(payload.TenantSlug))
		}

		orderID := payload.ID
		if orderID == "" {
			orderID = fmt.Sprintf("ORD-%d", time.Now().UnixNano()%1000000)
		}

		orderNumber := payload.OrderNumber
		if orderNumber == "" {
			orderNumber = fmt.Sprintf("OFIA-%d-%04d", time.Now().Year(), rand.Intn(9000)+1000)
		}

		channel := payload.Channel
		if channel == "" {
			channel = "STOREFRONT"
		}

		status := payload.Status
		if status == "" {
			status = "IN_PREPARATION"
		}

		paymentStatus := payload.PaymentStatus
		if paymentStatus == "" {
			paymentStatus = "PAID"
		}

		deliveryMethod := payload.DeliveryMethod
		if deliveryMethod == "" {
			deliveryMethod = "DISPATCH"
		}

		currency := payload.Currency
		if currency == "" {
			currency = "₦"
		}

		itemsSummary := payload.ItemsSummary
		if itemsSummary == "" && len(payload.Items) > 0 {
			var summaryParts []string
			for _, itm := range payload.Items {
				qty := itm.Quantity
				if qty <= 0 {
					qty = 1
				}
				summaryParts = append(summaryParts, fmt.Sprintf("%s (x%d)", itm.Title, qty))
			}
			itemsSummary = strings.Join(summaryParts, ", ")
		}

		itemCount := payload.ItemCount
		if itemCount <= 0 {
			if len(payload.Items) > 0 {
				itemCount = len(payload.Items)
			} else {
				itemCount = 1
			}
		}

		itemsBytes, _ := json.Marshal(payload.Items)

		_, err := targetDB.Exec(`
			INSERT INTO shop_orders (
				id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
				customer_phone, channel, status, payment_status, delivery_method,
				shipping_address, city, payment_method, items_summary, item_count,
				total_amount, raw_amount, currency, items, notes, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
				$17, $18, $19, $20, $21, NOW(), NOW()
			)
			ON CONFLICT (tenant_slug, order_number) DO UPDATE SET
				status = EXCLUDED.status,
				payment_status = EXCLUDED.payment_status,
				notes = EXCLUDED.notes,
				updated_at = NOW()`,
			orderID, orderNumber, slug, payload.TenantID, payload.CustomerName, payload.CustomerEmail,
			payload.CustomerPhone, channel, status, paymentStatus, deliveryMethod,
			payload.ShippingAddress, payload.City, payload.PaymentMethod, itemsSummary, itemCount,
			payload.TotalAmount, payload.RawAmount, currency, string(itemsBytes), payload.Notes,
		)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to create order: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		// Also persist individual items into relational shop_order_items table
		for idx, itm := range payload.Items {
			itemId := itm.ID
			if itemId == "" {
				itemId = fmt.Sprintf("ITM-%s-%d", orderID, idx+1)
			}
			qty := itm.Quantity
			if qty <= 0 {
				qty = 1
			}
			optionsBytes, _ := json.Marshal(itm.Options)

			_, _ = targetDB.Exec(`
				INSERT INTO shop_order_items (
					id, order_id, tenant_slug, product_id, title, price, quantity, image_url, options, created_at
				) VALUES (
					$1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
				) ON CONFLICT (id) DO NOTHING`,
				itemId, orderID, slug, itm.ProductID, itm.Title, itm.Price, qty, itm.ImageURL, string(optionsBytes),
			)
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"order": map[string]any{
				"id":          orderID,
				"orderNumber": orderNumber,
				"tenantSlug":  slug,
				"status":      status,
				"totalAmount": payload.TotalAmount,
				"createdAt":   time.Now().Format(time.RFC3339),
			},
		})

	case http.MethodPatch:
		var update struct {
			ID             string `json:"id"`
			OrderNumber    string `json:"orderNumber"`
			Status         string `json:"status"`
			PaymentStatus  string `json:"paymentStatus"`
			DeliveryMethod string `json:"deliveryMethod"`
			Notes          string `json:"notes"`
		}

		if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		lookupKey := update.ID
		if lookupKey == "" {
			lookupKey = update.OrderNumber
		}

		if lookupKey == "" {
			http.Error(w, `{"error": "Order ID or orderNumber is required for update"}`, http.StatusBadRequest)
			return
		}

		res, err := targetDB.Exec(`
			UPDATE shop_orders SET
				status = COALESCE(NULLIF($1, ''), status),
				payment_status = COALESCE(NULLIF($2, ''), payment_status),
				delivery_method = COALESCE(NULLIF($3, ''), delivery_method),
				notes = COALESCE(NULLIF($4, ''), notes),
				updated_at = NOW()
			WHERE (id = $5 OR order_number = $5) AND LOWER(tenant_slug) = $6`,
			update.Status, update.PaymentStatus, update.DeliveryMethod, update.Notes, lookupKey, slug,
		)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update order: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		rowsAff, _ := res.RowsAffected()
		if rowsAff == 0 {
			http.Error(w, `{"error": "Order not found"}`, http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"updated": true,
			"id":      lookupKey,
			"status":  update.Status,
		})

	case http.MethodDelete:
		lookupKey := r.URL.Query().Get("id")
		if lookupKey == "" {
			lookupKey = r.URL.Query().Get("orderNumber")
		}

		if lookupKey == "" {
			http.Error(w, `{"error": "id or orderNumber query param is required"}`, http.StatusBadRequest)
			return
		}

		_, err := targetDB.Exec(`
			DELETE FROM shop_orders 
			WHERE (id = $1 OR order_number = $1) AND LOWER(tenant_slug) = $2`,
			lookupKey, slug,
		)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete order: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"deleted": true,
		})

	default:
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

// HandleShopBookings handles GET (list), POST (create), and PATCH (status transition) for service appointments
func HandleShopBookings(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))

		query := `
			SELECT id, booking_number, tenant_slug, COALESCE(tenant_id, ''),
			       customer_name, COALESCE(customer_email, ''), customer_phone,
			       service_title, date_time, status, vertical, COALESCE(notes, ''),
			       amount, created_at, updated_at
			FROM shop_bookings
			WHERE LOWER(tenant_slug) = $1`

		args := []any{slug}
		if statusFilter != "" && !strings.EqualFold(statusFilter, "ALL") {
			query += " AND status = $2"
			args = append(args, statusFilter)
		}

		query += " ORDER BY created_at DESC LIMIT 100"

		rows, err := targetDB.Query(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch bookings: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		bookings := make([]ShopBooking, 0)
		for rows.Next() {
			var b ShopBooking
			var createdAt, updatedAt time.Time

			err := rows.Scan(
				&b.ID, &b.BookingNumber, &b.TenantSlug, &b.TenantID,
				&b.CustomerName, &b.CustomerEmail, &b.CustomerPhone,
				&b.ServiceTitle, &b.DateTime, &b.Status, &b.Vertical,
				&b.Notes, &b.Amount, &createdAt, &updatedAt,
			)
			if err != nil {
				continue
			}

			b.CreatedAt = createdAt.Format(time.RFC3339)
			b.UpdatedAt = updatedAt.Format(time.RFC3339)
			bookings = append(bookings, b)
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success":  true,
			"count":    len(bookings),
			"bookings": bookings,
		})

	case http.MethodPost:
		var payload struct {
			ID            string  `json:"id"`
			BookingNumber string  `json:"bookingNumber"`
			TenantSlug    string  `json:"tenantSlug"`
			TenantID      string  `json:"tenantId"`
			CustomerName  string  `json:"customerName"`
			CustomerEmail string  `json:"customerEmail"`
			CustomerPhone string  `json:"customerPhone"`
			ServiceTitle  string  `json:"serviceTitle"`
			DateTime      string  `json:"dateTime"`
			Status        string  `json:"status"`
			Vertical      string  `json:"vertical"`
			Notes         string  `json:"notes"`
			Amount        float64 `json:"amount"`
		}

		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(payload.CustomerName) == "" || strings.TrimSpace(payload.CustomerPhone) == "" {
			http.Error(w, `{"error": "Customer name and phone number are required"}`, http.StatusBadRequest)
			return
		}

		if payload.TenantSlug != "" {
			slug = strings.ToLower(strings.TrimSpace(payload.TenantSlug))
		}

		bookingID := payload.ID
		if bookingID == "" {
			bookingID = fmt.Sprintf("BK-%d", time.Now().UnixNano()%1000000)
		}

		bookingNumber := payload.BookingNumber
		if bookingNumber == "" {
			bookingNumber = fmt.Sprintf("TD-%05d", rand.Intn(90000)+10000)
		}

		status := payload.Status
		if status == "" {
			status = "PENDING"
		}

		vertical := payload.Vertical
		if vertical == "" {
			vertical = "cars"
		}

		dateTime := payload.DateTime
		if dateTime == "" {
			dateTime = "As scheduled with merchant"
		}

		serviceTitle := payload.ServiceTitle
		if serviceTitle == "" {
			serviceTitle = "Storefront Service Appointment"
		}

		_, err := targetDB.Exec(`
			INSERT INTO shop_bookings (
				id, booking_number, tenant_slug, tenant_id, customer_name, customer_email,
				customer_phone, service_title, date_time, status, vertical, notes, amount,
				created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
			)
			ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
				status = EXCLUDED.status,
				notes = EXCLUDED.notes,
				updated_at = NOW()`,
			bookingID, bookingNumber, slug, payload.TenantID, payload.CustomerName, payload.CustomerEmail,
			payload.CustomerPhone, serviceTitle, dateTime, status, vertical, payload.Notes, payload.Amount,
		)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to create booking: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"booking": map[string]any{
				"id":            bookingID,
				"bookingNumber": bookingNumber,
				"tenantSlug":    slug,
				"status":        status,
				"serviceTitle":  serviceTitle,
				"dateTime":      dateTime,
				"createdAt":     time.Now().Format(time.RFC3339),
			},
		})

	case http.MethodPatch:
		var update struct {
			ID            string  `json:"id"`
			BookingNumber string  `json:"bookingNumber"`
			Status        string  `json:"status"`
			Notes         string  `json:"notes"`
			DateTime      string  `json:"dateTime"`
			Amount        float64 `json:"amount"`
		}

		if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		lookupKey := update.ID
		if lookupKey == "" {
			lookupKey = update.BookingNumber
		}

		if lookupKey == "" {
			http.Error(w, `{"error": "Booking ID or bookingNumber is required for update"}`, http.StatusBadRequest)
			return
		}

		res, err := targetDB.Exec(`
			UPDATE shop_bookings SET
				status = COALESCE(NULLIF($1, ''), status),
				notes = COALESCE(NULLIF($2, ''), notes),
				date_time = COALESCE(NULLIF($3, ''), date_time),
				updated_at = NOW()
			WHERE (id = $4 OR booking_number = $4) AND LOWER(tenant_slug) = $5`,
			update.Status, update.Notes, update.DateTime, lookupKey, slug,
		)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update booking: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		rowsAff, _ := res.RowsAffected()
		if rowsAff == 0 {
			http.Error(w, `{"error": "Booking not found"}`, http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"updated": true,
			"id":      lookupKey,
			"status":  update.Status,
		})

	default:
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}
