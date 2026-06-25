package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/prisma/db"
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
	query := r.URL.Query()
	niche := query.Get("niche")
	subNiche := query.Get("sub_niche")
	specialty := query.Get("specialty")
	minRatingStr := query.Get("min_rating")
	keyword := query.Get("q")
	city := query.Get("city")
	
	var conditions []db.ProProfileWhereParam

	if niche != "" {
		mappedNiche := mapNicheSlug(niche)
		conditions = append(conditions, db.ProProfile.Or(
			db.ProProfile.Niche.Equals(mappedNiche),
			db.ProProfile.SubService.Equals(mappedNiche),
		))
	}
	if city != "" {
		conditions = append(conditions, db.ProProfile.City.Equals(city))
	}
	if subNiche != "" {
		conditions = append(conditions, db.ProProfile.SubService.Equals(subNiche))
	}
	if specialty != "" {
		conditions = append(conditions, db.ProProfile.Specialties.Contains(specialty))
	}
	if minRatingStr != "" {
		minRating, err := strconv.ParseFloat(minRatingStr, 64)
		if err == nil {
			conditions = append(conditions, db.ProProfile.Rating.Gte(minRating))
		}
	}
	if keyword != "" {
		conditions = append(conditions, db.ProProfile.Or(
			db.ProProfile.User.Where(db.User.Name.Contains(keyword)),
			db.ProProfile.Bio.Contains(keyword),
			db.ProProfile.Specialties.Contains(keyword),
		))
	}

	pros, err := internalDB.Client.ProProfile.FindMany(
		conditions...,
	).With(
		db.ProProfile.User.Fetch(),
		db.ProProfile.Services.Fetch(),
	).OrderBy(
		db.ProProfile.Rating.Order(db.SortOrderDesc),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error fetching pros", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pros)
}

func ListArticles(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	niche := query.Get("niche")
	keyword := query.Get("q")
	proId := query.Get("proId")

	var conditions []db.ArticleWhereParam

	if niche != "" {
		mappedNiche := mapNicheSlug(niche)
		conditions = append(conditions, db.Article.Niche.Equals(mappedNiche))
	}
	if proId != "" {
		conditions = append(conditions, db.Article.ProProfileID.Equals(proId))
	}
	if keyword != "" {
		conditions = append(conditions, db.Article.Or(
			db.Article.Title.Contains(keyword),
			db.Article.Content.Contains(keyword),
		))
	}

	articles, err := internalDB.Client.Article.FindMany(
		conditions...,
	).With(
		db.Article.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).OrderBy(
		db.Article.CreatedAt.Order(db.SortOrderDesc),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error fetching articles", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(articles)
}

func GetArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	article, err := internalDB.Client.Article.FindUnique(
		db.Article.ID.Equals(id),
	).With(
		db.Article.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "article not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}

func ListProducts(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	niche := query.Get("niche")
	keyword := query.Get("q")
	proId := query.Get("proId")
	city := query.Get("city")
	minPriceStr := query.Get("min_price")
	maxPriceStr := query.Get("max_price")
	homeDeliveryStr := query.Get("home_delivery")
	acceptsPosStr := query.Get("accepts_pos")

	var conditions []db.ProductWhereParam

	if niche != "" {
		mappedNiche := mapNicheSlug(niche)
		conditions = append(conditions, db.Product.ProProfile.Where(
			db.ProProfile.Or(
				db.ProProfile.Niche.Equals(mappedNiche),
				db.ProProfile.SubService.Equals(mappedNiche),
			),
		))
	}
	if proId != "" {
		conditions = append(conditions, db.Product.ProProfileID.Equals(proId))
	}
	if city != "" {
		conditions = append(conditions, db.Product.ProProfile.Where(db.ProProfile.City.Equals(city)))
	}
	if minPriceStr != "" {
		minPrice, err := strconv.ParseFloat(minPriceStr, 64)
		if err == nil {
			conditions = append(conditions, db.Product.Price.Gte(minPrice))
		}
	}
	if maxPriceStr != "" {
		maxPrice, err := strconv.ParseFloat(maxPriceStr, 64)
		if err == nil {
			conditions = append(conditions, db.Product.Price.Lte(maxPrice))
		}
	}
	if homeDeliveryStr == "true" {
		conditions = append(conditions, db.Product.ProProfile.Where(db.ProProfile.HomeDelivery.Equals(true)))
	}
	if acceptsPosStr == "true" {
		conditions = append(conditions, db.Product.ProProfile.Where(db.ProProfile.AcceptsPos.Equals(true)))
	}
	if keyword != "" {
		conditions = append(conditions, db.Product.Or(
			db.Product.Name.Contains(keyword),
			db.Product.Description.Contains(keyword),
		))
	}

	products, err := internalDB.Client.Product.FindMany(
		conditions...,
	).With(
		db.Product.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error fetching products", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func GetProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	product, err := internalDB.Client.Product.FindUnique(
		db.Product.ID.Equals(id),
	).With(
		db.Product.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func GetPro(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	pro, err := internalDB.Client.ProProfile.FindFirst(
		db.ProProfile.Or(
			db.ProProfile.ID.Equals(id),
			db.ProProfile.Slug.Equals(id),
		),
	).With(
		db.ProProfile.User.Fetch(),
		db.ProProfile.Services.Fetch(),
		db.ProProfile.Products.Fetch(),
		db.ProProfile.Bookings.Fetch(),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "pro not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pro)
}

func GetNicheStats(w http.ResponseWriter, r *http.Request) {
	pros, err := internalDB.Client.ProProfile.FindMany().Exec(context.Background())
	if err != nil {
		http.Error(w, "error fetching pros", http.StatusInternalServerError)
		return
	}

	stats := make(map[string]int)
	for _, pro := range pros {
		if niche, ok := pro.Niche(); ok && niche != "" {
			stats[niche]++
		}
		if subNiche, ok := pro.SubService(); ok && subNiche != "" {
			stats[subNiche]++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
