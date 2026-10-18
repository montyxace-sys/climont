/*
  # Restrict which job_applications columns the public may insert

  The previous REVOKE on the `status` column had no effect because a table-wide
  INSERT grant was still in place. Replace the table-wide grant with an explicit
  column list that matches exactly what the careers form sends, so an applicant
  cannot choose the review status of their own application.
*/

REVOKE INSERT ON job_applications FROM anon, authenticated;

GRANT INSERT (name, email, phone, position, experience_years, message, cv_file_path, cv_file_name)
  ON job_applications TO anon, authenticated;
