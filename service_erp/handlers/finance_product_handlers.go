package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

// HandleProducts handles products REST endpoints
func HandleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, name, sku, type, sale_price, purchase_price, quantity, can_purchase, image, created_at FROM products ORDER BY name ASC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		products := []Product{}
		for rows.Next() {
			var p Product
			var createdAt time.Time
			if err := rows.Scan(&p.ID, &p.Name, &p.Sku, &p.Type, &p.SalePrice, &p.PurchasePrice, &p.Quantity, &p.CanPurchase, &p.Image, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			p.CreatedAt = createdAt
			products = append(products, p)
		}
		json.NewEncoder(w).Encode(products)

	} else if r.Method == http.MethodPost {
		var p Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.Name == "" || p.Sku == "" || p.Type == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.ID == "" {
			p.ID = "prod-" + generateUUID()[:8]
		}
		if p.Image == "" {
			p.Image = "/favicon.png"
		}

		_, err := db.Exec("INSERT INTO products (id, name, sku, type, sale_price, purchase_price, quantity, can_purchase, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			p.ID, p.Name, p.Sku, p.Type, p.SalePrice, p.PurchasePrice, p.Quantity, p.CanPurchase, p.Image)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": p.ID})
	} else if r.Method == http.MethodPut {
		var p Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if p.ID == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, err := db.Exec("UPDATE products SET name = ?, sku = ?, type = ?, sale_price = ?, purchase_price = ?, quantity = ?, can_purchase = ?, image = ? WHERE id = ?",
			p.Name, p.Sku, p.Type, p.SalePrice, p.PurchasePrice, p.Quantity, p.CanPurchase, p.Image, p.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Product updated"})
	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, err := db.Exec("DELETE FROM products WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Product deleted"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleInventoryTransactions handles logging inventory movements
func HandleInventoryTransactions(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT it.id, it.product_id, p.name, it.transaction_type, it.quantity, it.reference, it.date, it.created_at " +
			"FROM inventory_transactions it JOIN products p ON it.product_id = p.id ORDER BY it.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		txs := []InventoryTransaction{}
		for rows.Next() {
			var it InventoryTransaction
			var ref string
			var createdAt time.Time
			if err := rows.Scan(&it.ID, &it.ProductID, &it.ProductName, &it.TransactionType, &it.Quantity, &ref, &it.Date, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			it.Reference = &ref
			it.CreatedAt = createdAt
			txs = append(txs, it)
		}
		json.NewEncoder(w).Encode(txs)

	} else if r.Method == http.MethodPost {
		var it InventoryTransaction
		if err := json.NewDecoder(r.Body).Decode(&it); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if it.ProductID == "" || it.TransactionType == "" || it.Quantity <= 0 || it.Date == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if it.ID == "" {
			it.ID = "itx-" + generateUUID()[:8]
		}

		var ref string
		if it.Reference != nil {
			ref = *it.Reference
		}

		tx, err := db.Begin()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		_, err = tx.Exec("INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, reference, date) VALUES (?, ?, ?, ?, ?, ?)",
			it.ID, it.ProductID, it.TransactionType, it.Quantity, ref, it.Date)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// Adjust actual product quantity in products table
		var qtyMod float64
		if it.TransactionType == "In" {
			qtyMod = it.Quantity
		} else {
			qtyMod = -it.Quantity
		}

		_, err = tx.Exec("UPDATE products SET quantity = quantity + ? WHERE id = ?", qtyMod, it.ProductID)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		tx.Commit()
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": it.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
