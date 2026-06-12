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

func ListPros(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	niche := query.Get("niche")
	specialty := query.Get("specialty")
	minRatingStr := query.Get("min_rating")
	keyword := query.Get("q")
	
	var conditions []db.ProProfileWhereParam

	if niche != "" {
		conditions = append(conditions, db.ProProfile.Niche.Equals(niche))
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
		conditions = append(conditions, db.Article.Niche.Equals(niche))
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

	var conditions []db.ProductWhereParam

	if niche != "" {
		conditions = append(conditions, db.Product.ProProfile.Where(db.ProProfile.Niche.Equals(niche)))
	}
	if proId != "" {
		conditions = append(conditions, db.Product.ProProfileID.Equals(proId))
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

	pro, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.ID.Equals(id),
	).With(
		db.ProProfile.User.Fetch(),
		db.ProProfile.Services.Fetch(),
		db.ProProfile.Products.Fetch(),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "pro not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pro)
}
