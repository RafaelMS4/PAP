# Swagger/OpenAPI Documentation

Swagger API documentation has been integrated into your IT HelpDesk backend using Swagger UI Express and Swagger JSDoc.

## 🚀 Quick Start

1. **Start the backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:5000/api-docs
   ```

3. **You'll see:**
   - All API endpoints
   - Request/response examples
   - Authentication requirements
   - Error codes and messages
   - Try-it-out functionality

## 📋 Current API Endpoints

### Authentication Routes

#### 1. Login
- **Method:** POST
- **Path:** `/api/auth/login`
- **Body:** `{ username, password }`
- **Response:** Token + User info

#### 2. Get Current User
- **Method:** GET
- **Path:** `/api/auth/me`
- **Auth:** Required (Bearer Token)
- **Response:** User details

#### 3. Get All Users (Admin Only)
- **Method:** GET
- **Path:** `/api/auth/users`
- **Auth:** Required (Admin role)
- **Response:** List of all users

#### 4. Create User (Admin Only)
- **Method:** POST
- **Path:** `/api/auth/users`
- **Auth:** Required (Admin role)
- **Body:** `{ username, password, email, role }`
- **Response:** New user object

---

## 📝 How to Document New Endpoints

When you add new API endpoints, document them using JSDoc comments in your route files.

### Example: Adding a Ticket Endpoint

**File:** `backend/src/routes/tickets.js`

```javascript
/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets
 *     description: Retrieves all support tickets
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/tickets', verifyToken, getTickets);
```

### JSDoc Swagger Tags Explained

| Tag | Purpose |
|-----|---------|
| `@swagger` | Start Swagger documentation block |
| `/path` | API endpoint path |
| `get/post/put/delete` | HTTP method |
| `summary` | Short description (appears in list) |
| `description` | Detailed description |
| `tags` | Group endpoints by category |
| `security` | Authentication requirement |
| `requestBody` | Request payload format |
| `responses` | All possible responses |
| `schema` | Data structure definition |

---

## 🔐 Authentication in Swagger

### Testing Protected Endpoints

1. **Login first:**
   - Click on `/auth/login` endpoint
   - Click "Try it out"
   - Enter: `{ "username": "admin", "password": "admin" }`
   - Copy the returned `token`

2. **Use the token:**
   - Click the green "Authorize" button at the top
   - Paste: `Bearer <your-token-here>`
   - Now all protected endpoints will use this token

### Marking Endpoints as Protected

```javascript
/**
 * @swagger
 * /protected-endpoint:
 *   get:
 *     security:
 *       - bearerAuth: []  // This marks it as requiring Bearer token
 */
router.get('/protected-endpoint', verifyToken, handler);
```

---

## 📂 File Structure

```
backend/src/
├── config/
│   ├── database.js
│   └── swagger.js          ← Swagger configuration
├── routes/
│   ├── index.js
│   └── auth.js            ← API endpoints with JSDoc
└── server.js              ← Swagger UI setup
```

---

## ✏️ Schema Definitions

Schemas are reusable data structure definitions. They're defined in `swagger.js`:

```javascript
User: {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'user', 'technician'] }
  }
}
```

### Reference Schemas in Endpoints

```javascript
/**
 * @swagger
 * /users:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  // References the User schema
 */
```

---

## 🎯 Common Swagger Patterns

### Error Response Template

```javascript
/**
 * @swagger
 * /my-endpoint:
 *   get:
 *     responses:
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### Query Parameters

```javascript
/**
 * @swagger
 * /users:
 *   get:
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results
 */
```

### Path Parameters

```javascript
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 */
```

---

## 🔍 Example: Full Documentation

Here's a complete example adding a new endpoint:

```javascript
/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieves a specific support ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: ['open', 'in_progress', 'closed']
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/tickets/:id', verifyToken, getTicketById);
```

---

## 💡 Tips

1. **Keep docs up-to-date** - Update JSDoc when you change endpoints
2. **Use tags** - Group related endpoints (e.g., `- Tickets`, `- Users`)
3. **Provide examples** - Use the `example` field in schemas
4. **Describe errors** - Include all possible error responses
5. **Test in Swagger** - Use "Try it out" to validate endpoints
6. **Schemas are reusable** - Define once in `swagger.js`, reference many times

---

## 🚀 Next Steps

1. ✅ Swagger is now running at `http://localhost:5000/api-docs`
2. 📝 Add documentation to new endpoints as you create them
3. 🧪 Use Swagger UI to test your API
4. 📚 Share the Swagger URL with frontend team

---

## 📚 Learn More

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc GitHub](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
