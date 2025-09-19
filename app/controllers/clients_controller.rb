class ClientsController < ApplicationController
  before_action :set_client, only: %i[show edit update destroy]

  # GET /clients
  def index
    @clients = Client.all
  end

  # GET /clients/:id
  def show; end

  # GET /clients/new
  def new
    @client = Client.new
  end

  # POST /clients
  def create
    @client = Client.new(client_params)
    if @client.save
      redirect_to @client, notice: "Cliente criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  # GET /clients/:id/edit
  def edit; end

  # PATCH/PUT /clients/:id
  def update
    if @client.update(client_params)
      redirect_to @client, notice: "Cliente atualizado com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /clients/:id
  def destroy
    @client.destroy
    redirect_to clients_url, notice: "Cliente removido com sucesso."
  end

  private

  def set_client
    @client = Client.find(params[:id])
  end

  def client_params
    params.require(:client).permit(:full_name, :cpf, :phone, :email, :password, :password_confirmation)
  end
end
