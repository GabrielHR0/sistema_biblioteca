every 1.day, at: '08:00 am' do
  runner "LoanReminderJob.perform_later"
end
