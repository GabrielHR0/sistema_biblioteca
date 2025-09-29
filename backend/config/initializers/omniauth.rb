Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, 
           ENV['GOOGLE_CLIENT_ID'], 
           ENV['GOOGLE_CLIENT_SECRET'],
           scope: 'https://www.googleapis.com/auth/gmail.send',
           access_type: 'offline',
           prompt: 'consent'
end

OmniAuth.config.allowed_request_methods = %i[get post]
