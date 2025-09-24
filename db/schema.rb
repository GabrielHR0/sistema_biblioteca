# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_24_012005) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "book_categories", force: :cascade do |t|
    t.bigint "book_id", null: false
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id", "category_id"], name: "index_book_categories_on_book_id_and_category_id", unique: true
    t.index ["book_id"], name: "index_book_categories_on_book_id"
    t.index ["category_id"], name: "index_book_categories_on_category_id"
  end

  create_table "books", force: :cascade do |t|
    t.string "title", null: false
    t.string "author", null: false
    t.integer "total_copies", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "clients", force: :cascade do |t|
    t.string "fullName", null: false
    t.string "cpf", null: false
    t.string "phone", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cpf"], name: "index_clients_on_cpf", unique: true
    t.index ["email"], name: "index_clients_on_email", unique: true
  end

  create_table "copies", force: :cascade do |t|
    t.bigint "book_id", null: false
    t.integer "number", null: false
    t.string "edition", null: false
    t.string "status", default: "available", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id", "number"], name: "index_copies_on_book_id_and_number", unique: true
    t.index ["book_id"], name: "index_copies_on_book_id"
  end

  create_table "email_accounts", force: :cascade do |t|
    t.bigint "library_id", null: false
    t.string "gmail_user_email"
    t.text "gmail_oauth_token"
    t.text "gmail_refresh_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["library_id"], name: "index_email_accounts_on_library_id"
  end

  create_table "fine_policies", force: :cascade do |t|
    t.bigint "library_id", null: false
    t.decimal "daily_fine"
    t.decimal "max_fine"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["library_id"], name: "index_fine_policies_on_library_id"
  end

  create_table "libraries", force: :cascade do |t|
    t.string "name"
    t.string "phone"
    t.string "address"
    t.string "logo_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "loan_policies", force: :cascade do |t|
    t.bigint "library_id", null: false
    t.integer "loan_limit"
    t.integer "loan_period_days"
    t.integer "renewals_allowed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["library_id"], name: "index_loan_policies_on_library_id"
  end

  create_table "loans", force: :cascade do |t|
    t.bigint "copy_id", null: false
    t.bigint "client_id", null: false
    t.bigint "user_id"
    t.date "loan_date", null: false
    t.date "due_date", null: false
    t.string "status", default: "ongoing", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "renewals_count"
    t.index ["client_id"], name: "index_loans_on_client_id"
    t.index ["copy_id"], name: "index_loans_on_copy_id"
    t.index ["user_id"], name: "index_loans_on_user_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_roles_on_name", unique: true
  end

  create_table "user_roles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "role_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role_id"], name: "index_user_roles_on_role_id"
    t.index ["user_id"], name: "index_user_roles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "password_changed"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "book_categories", "books"
  add_foreign_key "book_categories", "categories"
  add_foreign_key "copies", "books"
  add_foreign_key "email_accounts", "libraries"
  add_foreign_key "fine_policies", "libraries"
  add_foreign_key "loan_policies", "libraries"
  add_foreign_key "loans", "clients"
  add_foreign_key "loans", "copies"
  add_foreign_key "loans", "users"
  add_foreign_key "user_roles", "roles"
  add_foreign_key "user_roles", "users", on_delete: :cascade
end
