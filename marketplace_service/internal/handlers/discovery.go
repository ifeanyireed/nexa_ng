package handlers

import (
	"encoding/json"
	"net/http"
	internalDB "nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/models"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func mapNicheSlug(slug string) string {
	switch slug {
	case "fashion-grooming":
		return "fashion"
	case "professional-services":
		return "professionals"
	case "education-skills":
		return "education"
	case "events-entertainment":
		return "events"
	case "health-wellness":
		return "health"
	case "logistics-transport":
		return "logistics"
	case "automotive-services":
		return "auto"
	case "food-agribusiness":
		return "food"
	case "real-estate-construction":
		return "realestate"
	default:
		return slug
	}
}

func ListPros(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	query := r.URL.Query()
	niche := query.Get("niche")
	subNiche := query.Get("sub_niche")
	specialty := query.Get("specialty")
	minRatingStr := query.Get("min_rating")
	keyword := query.Get("q")
	city := query.Get("city")

	dbQuery := internalDB.DB.Model(&models.ProProfile{}).
		Preload("User").
		Preload("Services")

	if niche != "" {
		mappedNiche := mapNicheSlug(niche)
		dbQuery = dbQuery.Where("(niche = ? OR sub_service = ?)", mappedNiche, mappedNiche)
	}
	if city != "" {
		dbQuery = dbQuery.Where("city = ?", city)
	}
	if subNiche != "" {
		dbQuery = dbQuery.Where("sub_service = ?", subNiche)
	}
	if specialty != "" {
		dbQuery = dbQuery.Where("specialties LIKE ?", "%"+specialty+"%")
	}
	if minRatingStr != "" {
		if minRating, err := strconv.ParseFloat(minRatingStr, 64); err == nil {
			dbQuery = dbQuery.Where("rating >= ?", minRating)
		}
	}
	if keyword != "" {
		dbQuery = dbQuery.Joins("LEFT JOIN `User` on `User`.id = `ProProfile`.user_id").
			Where("`User`.name LIKE ? OR `ProProfile`.bio LIKE ? OR `ProProfile`.specialties LIKE ? OR `ProProfile`.business_name LIKE ?",
				"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var pros []models.ProProfile
	if err := dbQuery.Order("rating desc").Find(&pros).Error; err != nil {
		http.Error(w, "error fetching pros: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pros)
}

func ListArticles(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	query := r.URL.Query()
	niche := query.Get("niche")
	keyword := query.Get("q")
	proId := query.Get("proId")

	dbQuery := internalDB.DB.Model(&models.Article{}).
		Preload("ProProfile").
		Preload("ProProfile.User")

	if niche != "" {
		mappedNiche := mapNicheSlug(niche)
		dbQuery = dbQuery.Where("niche = ?", mappedNiche)
	}
	if proId != "" {
		dbQuery = dbQuery.Where("pro_profile_id = ?", proId)
	}
	if keyword != "" {
		dbQuery = dbQuery.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var articles []models.Article
	if err := dbQuery.Order("created_at desc").Find(&articles).Error; err != nil {
		http.Error(w, "error fetching articles: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(articles)
}

func GetArticle(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var article models.Article
	if err := internalDB.DB.Preload("ProProfile").
		Preload("ProProfile.User").
		Where("id = ?", id).
		First(&article).Error; err != nil {
		http.Error(w, "article not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}

func ListProducts(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	query := r.URL.Query()
	niche := query.Get("niche")
	keyword := query.Get("q")
	proId := query.Get("proId")
	city := query.Get("city")
	minPriceStr := query.Get("min_price")
	maxPriceStr := query.Get("max_price")
	homeDeliveryStr := query.Get("home_delivery")
	acceptsPosStr := query.Get("accepts_pos")

	dbQuery := internalDB.DB.Model(&models.Product{}).
		Preload("ProProfile").
		Preload("ProProfile.User")

	if niche != "" || city != "" || homeDeliveryStr != "" || acceptsPosStr != "" {
		dbQuery = dbQuery.Joins("LEFT JOIN `ProProfile` on `ProProfile`.id = `Product`.pro_profile_id")
		if niche != "" {
			mappedNiche := mapNicheSlug(niche)
			dbQuery = dbQuery.Where("(`ProProfile`.niche = ? OR `ProProfile`.sub_service = ?)", mappedNiche, mappedNiche)
		}
		if city != "" {
			dbQuery = dbQuery.Where("`ProProfile`.city = ?", city)
		}
		if homeDeliveryStr == "true" {
			dbQuery = dbQuery.Where("`ProProfile`.home_delivery = ?", true)
		}
		if acceptsPosStr == "true" {
			dbQuery = dbQuery.Where("`ProProfile`.accepts_pos = ?", true)
		}
	}

	if proId != "" {
		dbQuery = dbQuery.Where("pro_profile_id = ?", proId)
	}
	if minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			dbQuery = dbQuery.Where("price >= ?", minPrice)
		}
	}
	if maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			dbQuery = dbQuery.Where("price <= ?", maxPrice)
		}
	}
	if keyword != "" {
		dbQuery = dbQuery.Where("`Product`.name LIKE ? OR `Product`.description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var products []models.Product
	if err := dbQuery.Order("price desc").Find(&products).Error; err != nil {
		if err := internalDB.DB.Find(&products).Error; err != nil {
			http.Error(w, "error fetching products: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func GetProduct(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var product models.Product
	if err := internalDB.DB.Preload("ProProfile").
		Preload("ProProfile.User").
		Where("id = ?", id).
		First(&product).Error; err != nil {
		http.Error(w, "product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func GetPro(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var pro models.ProProfile
	if err := internalDB.DB.Preload("User").
		Preload("Services").
		Preload("Products").
		Preload("Bookings").
		Where("id = ? OR slug = ?", id, id).
		First(&pro).Error; err != nil {
		http.Error(w, "pro not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pro)
}

func GetNicheStats(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	var pros []models.ProProfile
	if err := internalDB.DB.Select("niche, sub_service").Find(&pros).Error; err != nil {
		http.Error(w, "error fetching pros: "+err.Error(), http.StatusInternalServerError)
		return
	}

	stats := make(map[string]int)
	for _, pro := range pros {
		if pro.Niche != "" {
			stats[pro.Niche]++
		}
		if pro.SubService != "" {
			stats[pro.SubService]++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
