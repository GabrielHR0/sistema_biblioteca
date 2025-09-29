every 1.day, at: '08:00 am' do
  runner "LoanReminderJob.perform_later"
end

every 1.day, at: '1:00 am' do
  runner "MarkOverdueLoansJob.perform_later"
end
