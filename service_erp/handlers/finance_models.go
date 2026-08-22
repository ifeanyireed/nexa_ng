package handlers

import (
	"time"
)

type Expense struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Category    string     `json:"category"`
	Amount      float64    `json:"amount"`
	Status      string     `json:"status"` // "Pending", "Approved", "Disbursed", "Rejected"
	RequestedBy string     `json:"requestedBy"`
	ApprovedBy  *string    `json:"approvedBy,omitempty"`
	Description *string    `json:"description,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Invoice struct {
	ID            string    `json:"id"`
	InvoiceNumber string    `json:"invoiceNumber"`
	CustomerName  string    `json:"customerName"`
	CustomerEmail string    `json:"customerEmail"`
	Amount        float64   `json:"amount"`
	DueDate       string    `json:"dueDate"`
	Status        string    `json:"status"` // "Unpaid", "Paid", "Overdue", "Cancelled"
	Description   *string   `json:"description,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Reconciliation struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Type           string    `json:"type"` // "Logistics", "KHLC", "Shuttle", "Rental Bus"
	PeriodStart    string    `json:"periodStart"`
	PeriodEnd      string    `json:"periodEnd"`
	ExpectedAmount float64   `json:"expectedAmount"`
	ActualAmount   float64   `json:"actualAmount"`
	Discrepancy    float64   `json:"discrepancy"`
	Status         string    `json:"status"` // "Pending", "Resolved", "Flagged"
	PreparedBy     string    `json:"preparedBy"`
	Notes          *string   `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Transaction struct {
	ID          string    `json:"id"`
	ReferenceID *string   `json:"referenceId,omitempty"`
	Type        string    `json:"type"` // "Credit" (Revenue) or "Debit" (Expense)
	Category    string    `json:"category"`
	Amount      float64   `json:"amount"`
	Date        string    `json:"date"`
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type DashboardStats struct {
	TotalRevenue       float64 `json:"totalRevenue"`
	TotalExpenses      float64 `json:"totalExpenses"`
	PendingPayables    float64 `json:"pendingPayables"`
	OutstandingInvoice float64 `json:"outstandingInvoice"`
}

type Client struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	SubName     string    `json:"subName"`
	Email       string    `json:"email"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	CompanyName string    `json:"companyName"`
	Phone       string    `json:"phone"`
	Website     string    `json:"website"`
	Vat         string    `json:"vat"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Account struct {
	ID             string  `json:"id"`
	Code           string  `json:"code"`
	Name           string  `json:"name"`
	Category       string  `json:"category"` // "Asset", "Liability", "Equity", "Revenue", "Expense"
	NormalBalance  string  `json:"normalBalance"` // "Debit", "Credit"
	OpeningBalance float64 `json:"openingBalance"`
	Debits         float64 `json:"debits"`
	Credits        float64 `json:"credits"`
	ClosingBalance float64 `json:"closingBalance"`
}

type JournalEntry struct {
	ID          string        `json:"id"`
	EntryDate   string        `json:"entryDate"`
	ReferenceNo *string       `json:"referenceNo,omitempty"`
	Description *string       `json:"description,omitempty"`
	Status      string        `json:"status"` // "Draft", "Posted"
	Items       []JournalItem `json:"items,omitempty"`
	CreatedAt   time.Time     `json:"createdAt"`
}

type JournalItem struct {
	ID             string   `json:"id"`
	JournalEntryID string   `json:"journalEntryId"`
	AccountID      string   `json:"accountId"`
	AccountCode    string   `json:"accountCode,omitempty"`
	AccountName    string   `json:"accountName,omitempty"`
	Description    *string  `json:"description,omitempty"`
	Debit          float64  `json:"debit"`
	Credit         float64  `json:"credit"`
}

type RecurringJournal struct {
	ID          string    `json:"id"`
	ProfileName string    `json:"profileName"`
	Frequency   string    `json:"frequency"` // "Daily", "Weekly", "Monthly", "Yearly"
	StartDate   string    `json:"startDate"`
	EndDate     *string   `json:"endDate,omitempty"`
	NextRunDate string    `json:"nextRunDate"`
	Status      string    `json:"status"` // "Active", "Paused", "Completed"
	CreatedAt   time.Time `json:"createdAt"`
}

type Proposal struct {
	ID             string    `json:"id"`
	ProposalNumber string    `json:"proposalNumber"`
	ClientID       string    `json:"clientId"`
	ClientName     string    `json:"clientName,omitempty"`
	Amount         float64   `json:"amount"`
	Status         string    `json:"status"` // "Draft", "Sent", "Accepted", "Declined"
	ValidUntil     string    `json:"validUntil"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Estimate struct {
	ID             string    `json:"id"`
	EstimateNumber string    `json:"estimateNumber"`
	ClientID       string    `json:"clientId"`
	ClientName     string    `json:"clientName,omitempty"`
	Amount         float64   `json:"amount"`
	Status         string    `json:"status"` // "Draft", "Sent", "Accepted", "Expired"
	CreatedAt      time.Time `json:"createdAt"`
}

type Retainer struct {
	ID             string    `json:"id"`
	RetainerNumber string    `json:"retainerNumber"`
	ClientID       string    `json:"clientId"`
	ClientName     string    `json:"clientName,omitempty"`
	Amount         float64   `json:"amount"`
	Status         string    `json:"status"` // "Pending", "Paid", "Refunded"
	CreatedAt      time.Time `json:"createdAt"`
}

type CreditNote struct {
	ID               string    `json:"id"`
	CreditNoteNumber string    `json:"creditNoteNumber"`
	ClientID         string    `json:"clientId"`
	ClientName       string    `json:"clientName,omitempty"`
	InvoiceID        *string   `json:"invoiceId,omitempty"`
	Amount           float64   `json:"amount"`
	Reason           *string   `json:"reason,omitempty"`
	Status           string    `json:"status"` // "Unused", "Applied", "Refunded"
	CreatedAt        time.Time `json:"createdAt"`
}

type Vendor struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	CompanyName string    `json:"companyName"`
	Status      string    `json:"status"` // "Active", "Inactive"
	CreatedAt   time.Time `json:"createdAt"`
}

type Bill struct {
	ID          string    `json:"id"`
	BillNumber  string    `json:"billNumber"`
	VendorID    string    `json:"vendorId"`
	VendorName  string    `json:"vendorName,omitempty"`
	Amount      float64   `json:"amount"`
	DueDate     string    `json:"dueDate"`
	Status      string    `json:"status"` // "Draft", "Unpaid", "Paid", "Overdue"
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type DebitNote struct {
	ID              string    `json:"id"`
	DebitNoteNumber string    `json:"debitNoteNumber"`
	VendorID        string    `json:"vendorId"`
	VendorName      string    `json:"vendorName,omitempty"`
	BillID          *string   `json:"billId,omitempty"`
	Amount          float64   `json:"amount"`
	Reason          *string   `json:"reason,omitempty"`
	Status          string    `json:"status"` // "Unused", "Applied", "Refunded"
	CreatedAt       time.Time `json:"createdAt"`
}

type BankAccount struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	AccountNo string    `json:"accountNo"`
	BankName  string    `json:"bankName"`
	Currency  string    `json:"currency"`
	Status    string    `json:"status"` // "Active", "Inactive"
	Balance   float64   `json:"balance"`
	CreatedAt time.Time `json:"createdAt"`
}

type BankReconciliation struct {
	ID                string    `json:"id"`
	BankAccountID     string    `json:"bankAccountId"`
	BankAccountName   string    `json:"bankAccountName,omitempty"`
	StatementDate     string    `json:"statementDate"`
	EndingBalance     float64   `json:"endingBalance"`
	ReconciledBalance float64   `json:"reconciledBalance"`
	Difference        float64   `json:"difference"`
	Status            string    `json:"status"` // "In Progress", "Reconciled"
	PreparedBy        string    `json:"preparedBy"`
	Notes             *string   `json:"notes,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
}

type Product struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Sku           string    `json:"sku"`
	Type          string    `json:"type"` // "Product", "Service"
	SalePrice     float64   `json:"salePrice"`
	PurchasePrice float64   `json:"purchasePrice"`
	Quantity      float64   `json:"quantity"`
	CanPurchase   bool      `json:"canPurchase"`
	Image         string    `json:"image"`
	CreatedAt     time.Time `json:"createdAt"`
}

type InventoryTransaction struct {
	ID              string    `json:"id"`
	ProductID       string    `json:"productId"`
	ProductName     string    `json:"productName,omitempty"`
	TransactionType string    `json:"transactionType"` // "In", "Out"
	Quantity        float64   `json:"quantity"`
	Reference       *string   `json:"reference,omitempty"`
	Date            string    `json:"date"`
	CreatedAt       time.Time `json:"createdAt"`
}

type Payroll struct {
	ID          string    `json:"id"`
	PeriodMonth int       `json:"periodMonth"`
	PeriodYear  int       `json:"periodYear"`
	TotalAmount float64   `json:"totalAmount"`
	Status      string    `json:"status"` // "Draft", "Approved", "Disbursed"
	CreatedAt   time.Time `json:"createdAt"`
}

type EmployeeSalary struct {
	ID           string  `json:"id"`
	PayrollID    string  `json:"payrollId"`
	EmployeeName string  `json:"employeeName"`
	BasicSalary  float64 `json:"basicSalary"`
	Allowances   float64 `json:"allowances"`
	Deductions   float64 `json:"deductions"`
	NetSalary    float64 `json:"netSalary"`
	Status       string  `json:"status"` // "Pending", "Paid"
}

type StatutoryRemittance struct {
	ID          string     `json:"id"`
	Type        string     `json:"type"` // "VAT", "WHT", "Pension", "PAYE"
	Amount      float64    `json:"amount"`
	PeriodMonth int        `json:"periodMonth"`
	PeriodYear  int        `json:"periodYear"`
	DueDate     string     `json:"dueDate"`
	Status      string     `json:"status"` // "Pending", "Paid"
	PaymentDate *string    `json:"paymentDate,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
}

type Order struct {
	ID        string    `json:"id"`
	Client    string    `json:"client"`
	Total     float64   `json:"total"`
	OrderDate string    `json:"orderDate"`
	Note      *string   `json:"note,omitempty"`
	Status    string    `json:"status"` // "Pending", "Completed", "Cancelled"
	CreatedAt time.Time `json:"createdAt"`
}
