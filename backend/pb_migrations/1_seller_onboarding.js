migrate((db) => {
  // Add role field to users collection
  const usersCollection = db.findCollectionByNameOrId("users")
  usersCollection.schema.addField({
    "system": false,
    "id": "role_field",
    "name": "role",
    "type": "select",
    "required": true,
    "options": {
      "maxSelect": 1,
      "values": ["seller", "approver"]
    }
  })
  db.saveCollection(usersCollection)

  // seller_profiles collection
  const sellerProfiles = new Collection({
    "name": "seller_profiles",
    "type": "base",
    "schema": [
      { "name": "seller", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": true, "maxSelect": 1, "minSelect": 0 } },
      { "name": "business_name", "type": "text" },
      { "name": "ein", "type": "text" },
      { "name": "contact_number", "type": "text" },
      { "name": "admin_name", "type": "text" },
      { "name": "business_type", "type": "text" },
      { "name": "website", "type": "text" },
      { "name": "business_address", "type": "json" },
      { "name": "warehouses", "type": "json" },
      { "name": "brands", "type": "json" },
      { "name": "privacy_policy", "type": "text" },
      { "name": "return_window_days", "type": "number" },
      { "name": "restocking_fee_percent", "type": "number" },
      { "name": "return_description", "type": "text" },
      { "name": "duns_number", "type": "text" },
      { "name": "tin", "type": "text" },
      { "name": "profile_status", "type": "select", "options": { "maxSelect": 1, "values": ["yet_to_submit", "in_progress", "verification_pending", "approved", "action_needed"] } },
      { "name": "stripe_connected", "type": "bool" },
      { "name": "integrations", "type": "json" },
      { "name": "partner_services", "type": "json" }
    ]
  })
  db.saveCollection(sellerProfiles)

  // seller_documents collection
  const sellerDocs = new Collection({
    "name": "seller_documents",
    "type": "base",
    "schema": [
      { "name": "seller", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": true, "maxSelect": 1, "minSelect": 0 } },
      { "name": "doc_type", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["w9", "form_8822b", "address_proof"] } },
      { "name": "file", "type": "file", "options": { "maxSelect": 1, "maxSize": 10485760, "mimeTypes": ["application/pdf", "image/jpeg", "image/png"] } },
      { "name": "status", "type": "select", "options": { "maxSelect": 1, "values": ["not_uploaded", "pending", "approved", "rejected"] } },
      { "name": "rejection_reason", "type": "text" }
    ]
  })
  db.saveCollection(sellerDocs)

  // brand_docs collection
  const brandDocs = new Collection({
    "name": "brand_docs",
    "type": "base",
    "schema": [
      { "name": "seller", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": true, "maxSelect": 1, "minSelect": 0 } },
      { "name": "brand_name", "type": "text", "required": true },
      { "name": "classification", "type": "select", "options": { "maxSelect": 1, "values": ["reseller", "original_manufacturer"] } },
      { "name": "auth_file", "type": "file", "options": { "maxSelect": 1, "maxSize": 10485760, "mimeTypes": ["application/pdf", "image/jpeg", "image/png"] } },
      { "name": "status", "type": "select", "options": { "maxSelect": 1, "values": ["not_uploaded", "pending", "approved", "rejected"] } },
      { "name": "rejection_reason", "type": "text" }
    ]
  })
  db.saveCollection(brandDocs)

}, (db) => {
  // Rollback
  try { db.deleteCollection("brand_docs") } catch(e) {}
  try { db.deleteCollection("seller_documents") } catch(e) {}
  try { db.deleteCollection("seller_profiles") } catch(e) {}

  const usersCollection = db.findCollectionByNameOrId("users")
  usersCollection.schema.removeField("role_field")
  db.saveCollection(usersCollection)
})
