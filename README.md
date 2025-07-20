# CSV File Extractor

A full-stack Spring Boot + JavaScript application for uploading, previewing, and extracting data from CSV files, with user management and a modern, responsive frontend.

---

## Features

- **CSV Upload & Preview:** Upload CSV files, preview data in a paginated table (10 users per page).
- **User Extraction:** Save users from CSV to a PostgreSQL database (auto-generated IDs, duplicate emails skipped).
- **User Search:** Search for users by backend-generated ID and view their details.
- **Column Selection:** Select which columns to extract from the CSV.
- **Download Extracted Data:** Download selected columns as a new CSV.
- **Light/Dark Theme Toggle:** Switch between light and dark UI themes.
- **Responsive UI:** Modern, mobile-friendly design.
- **Toast Notifications:** User-friendly feedback for all actions.

---

## Tech Stack

- **Backend:** Spring Boot, Spring Data JPA, PostgreSQL
- **Frontend:** HTML, CSS, Vanilla JavaScript (no frameworks)
- **Build:** Maven

---

## Project Structure

```
fileextractor/
├── src/
│   ├── main/
│   │   ├── java/com/csv/fileextractor/
│   │   │   ├── controller/         # REST controllers (CSV, User)
│   │   │   ├── model/              # JPA entities (User, CSVFile)
│   │   │   ├── repository/         # Spring Data JPA repositories
│   │   │   └── service/            # Business logic
│   │   └── resources/
│   │       ├── static/             # Frontend (index.html, script.js, styles.css)
│   │       └── application.properties # DB config
│   └── test/
│       └── java/                   # Tests
├── pom.xml                         # Maven build file
└── README.md                       # (You are here)
```

---

## Setup & Installation

### 1. **Clone the Repository**
```bash
git clone <your-repo-url>
cd fileextractor
```

### 2. **Configure PostgreSQL**
- Create a database named `csvextractor`.
- Update `src/main/resources/application.properties` with your DB username and password.

### 3. **Build & Run the Backend**
```bash
./mvnw spring-boot:run
```
or
```bash
mvn spring-boot:run
```

### 4. **Access the Frontend**
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Usage

### **Uploading a CSV**
- Click "Choose File" or drag-and-drop a CSV.
- Preview the data (10 users per page).
- Click "Save Users to Database" to store users (IDs auto-generated, duplicate emails skipped).

### **Searching for a User**
- Enter a user ID in the "Find User by Backend ID" field.
- View user details if found.

### **Extracting Columns**
- Select columns to extract.
- Click "Extract Selected Columns" to download a new CSV with only those columns.

---

## API Endpoints

### **User API**
- `POST /api/users/upload-csv`  
  Upload users as JSON array (no `id` field required).
- `GET /api/users/{id}`  
  Get user details by backend-generated ID.

### **CSV File API**
- `POST /api/upload`  
  Upload a CSV file (for file management, not user extraction).
- `GET /api/files`  
  List all uploaded CSV files.

> **Add API response/request snapshots here:**
>
> ![upload](https://github.com/user-attachments/assets/418ee83b-72f1-433d-82a4-3b9459eed7ec)
> ![get all users](https://github.com/user-attachments/assets/cc82c58b-c4a8-4da1-b9c5-e933e5d8da61)

---

## Frontend Snapshots

> **Add screenshots of the UI here:**
>
> <img width="1920" height="2037" alt="image" src="https://github.com/user-attachments/assets/4f408f43-5624-4210-bbd4-081555dfa499" />


---

## Example CSV Format

```
name,email,age,address
John Doe,john@example.com,30,123 Main St
Jane Smith,jane@example.com,25,456 Oak Ave
```

---

## Customization

- **Pagination:** Change `this.rowsPerPage` in `script.js` to adjust users per page.
- **Theme:** Toggle light/dark mode with the button in the header.
- **Database:** Uses PostgreSQL by default; update `application.properties` for other DBs.

---

## License

MIT (or your license here)

---

## Credits

- Built with Spring Boot, PostgreSQL, and modern JavaScript.
