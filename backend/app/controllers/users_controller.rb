class UsersController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update, :destroy]
  before_action :set_user, only: %i[show edit update destroy]

  # GET /users
  def index
    @users = User.includes(:roles).all
    render json: @users.as_json(include: { roles: {only: [:id, :name] } } )
  end

  # GET /users/:id
  def show
    @user = User.includes(:roles).all
    render json: @user.as_json(include: { roles: {only: [:id, :name] } } )
  end

  # POST /users
  def create
    @user = User.new(user_params) 

    if user_params[:password].blank? || user_params[:password_confirmation].blank?
      return render json: { error: "Senha e confirmação são obrigatórias" }, status: :unprocessable_entity
    end

    if user_params[:password] != user_params[:password_confirmation]
      return render json: { error: "Senha e confirmação não coincidem" }, status: :unprocessable_entity
    end

    if @user.save
      assign_roles(@user)
      render json: @user, status: :created
    else
      render json: { error: @user.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/:id
  def update
    user_attrs = user_params.to_h.compact
    role_ids = params[:role_ids] || (params[:user] && params[:user][:role_ids])

    if user_attrs.blank? && role_ids.blank?
      render json: { message: "Nenhuma alteração recebida" }, status: :no_content
      return
    end

    password_being_changed = user_attrs[:password].present?

    if @user.update(user_attrs)
      @user.update(password_changed: true) if password_being_changed

      assign_roles(@user) if role_ids.present?

      render json: @user
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # POST /users/verify_password
  def verify_password
    password = params[:password]

    if password.blank?
      return render json: { error: "Senha não fornecida" }, status: :unprocessable_entity
    end

    if @current_user.authenticate(password)
      render json: { valid: true }, status: :ok
    else
      render json: { valid: false, error: "Senha incorreta" }, status: :unauthorized
    end
  end


  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Usuário não encontrado" }, status: :not_found
  end

  def user_params
    params.permit(:name, :email, :password, :password_confirmation)
  end

  def require_admin
    unless @current_user&.has_access?(:Administrator)
      render json: { error: "Acesso negado: precisa ser administrador" }, status: :forbidden
    end
  end

  def require_staff
    unless @current_user&.has_access?(:Administrator) || @current_user&.has_access?(:Librarian)
      render json: { error: "Acesso negado: precisa ser funcionário" }, status: :forbidden
    end
  end

  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded
      puts "Usuario logado realizando requisição: #{@current_user.inspect}"
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      render json: { errors: 'Token inválido ou expirado' }, status: :unauthorized
    end
  end

  def assign_roles(user)
    return unless params[:role_ids].present? || (params[:user] && params[:user][:role_ids].present?)

    new_role_ids = params[:role_ids] || params[:user][:role_ids]
    new_role_ids = Array(new_role_ids).map(&:to_i).reject(&:blank?)
    puts "Role IDs recebidos na requisição: #{new_role_ids.inspect}"

    current_role_ids = user.roles.pluck(:id)
    puts "Roles atuais do usuário antes da atualização: #{current_role_ids.inspect}"

    to_add = new_role_ids - current_role_ids
    puts "Roles que serão adicionadas: #{to_add.inspect}"
    to_add.each do |role_id|
      UserRole.create(user_id: user.id, role_id: role_id)
      puts "Role #{role_id} associada ao usuário #{user.id}"
    end

    to_remove = current_role_ids - new_role_ids
    puts "Roles que serão removidas: #{to_remove.inspect}"
    UserRole.where(user_id: user.id, role_id: to_remove).destroy_all
    to_remove.each do |role_id|
      puts "Role #{role_id} removida do usuário #{user.id}"
    end

    puts "Roles finais do usuário: #{user.roles.reload.pluck(:id).inspect}"
  end

end
