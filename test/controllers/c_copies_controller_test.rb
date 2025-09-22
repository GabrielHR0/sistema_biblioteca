require "test_helper"

class CCopiesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get c_copies_index_url
    assert_response :success
  end

  test "should get show" do
    get c_copies_show_url
    assert_response :success
  end

  test "should get new" do
    get c_copies_new_url
    assert_response :success
  end

  test "should get create" do
    get c_copies_create_url
    assert_response :success
  end

  test "should get edit" do
    get c_copies_edit_url
    assert_response :success
  end

  test "should get update" do
    get c_copies_update_url
    assert_response :success
  end

  test "should get destroy" do
    get c_copies_destroy_url
    assert_response :success
  end
end
