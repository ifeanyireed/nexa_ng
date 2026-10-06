package models

import (
	"time"
)

// BlogPost represents a published or draft blog post/article
type BlogPost struct {
	ID          string     `gorm:"primaryKey;size:191" json:"id"`
	Title       string     `gorm:"size:255;not null" json:"title"`
	Slug        string     `gorm:"uniqueIndex;size:255;not null" json:"slug"`
	Excerpt     string     `gorm:"type:text" json:"excerpt"`
	Content     string     `gorm:"type:text;not null" json:"content"`
	CoverImage  string     `gorm:"type:text" json:"cover_image"`
	CategoryID  *string    `gorm:"size:191;index" json:"category_id"`
	Tags        string     `gorm:"size:255" json:"tags"`
	Status      string     `gorm:"size:50;not null;default:'DRAFT'" json:"status"` // DRAFT, PUBLISHED, ARCHIVED
	AuthorID    *string    `gorm:"size:191" json:"author_id"`
	AuthorName  string     `gorm:"size:191;default:'Ofia Editorial Team'" json:"author_name"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relationships
	Category *BlogCategory  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Comments []BlogComment  `gorm:"foreignKey:PostID" json:"comments,omitempty"`
}

func (BlogPost) TableName() string {
	return "BlogPost"
}

// BlogCategory represents a category for grouping blog posts
type BlogCategory struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	Name      string    `gorm:"size:191;not null;uniqueIndex" json:"name"`
	Slug      string    `gorm:"size:191;not null;uniqueIndex" json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

func (BlogCategory) TableName() string {
	return "BlogCategory"
}

// BlogTag represents a tag that can be attached to posts
type BlogTag struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	Name      string    `gorm:"size:191;not null;uniqueIndex" json:"name"`
	Slug      string    `gorm:"size:191;not null;uniqueIndex" json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

func (BlogTag) TableName() string {
	return "BlogTag"
}

// BlogComment represents a user comment on a blog post
type BlogComment struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	PostID    string    `gorm:"size:191;not null;index" json:"post_id"`
	UserName  string    `gorm:"size:191;not null" json:"user_name"`
	Email     string    `gorm:"size:191" json:"email"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ParentID  *string   `gorm:"size:191;index" json:"parent_id"`
	Status    string    `gorm:"size:50;not null;default:'APPROVED'" json:"status"` // PENDING, APPROVED, REJECTED
	CreatedAt time.Time `json:"created_at"`
}

func (BlogComment) TableName() string {
	return "BlogComment"
}

// BlogSubscriber represents an email subscriber to the blog newsletter
type BlogSubscriber struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	Email     string    `gorm:"size:191;not null;uniqueIndex" json:"email"`
	Status    string    `gorm:"size:50;not null;default:'ACTIVE'" json:"status"` // ACTIVE, UNSUBSCRIBED
	CreatedAt time.Time `json:"created_at"`
}

func (BlogSubscriber) TableName() string {
	return "BlogSubscriber"
}
