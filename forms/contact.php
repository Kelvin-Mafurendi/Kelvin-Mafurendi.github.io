<?php
  // Replace contact@example.com with your real receiving email address
  $receiving_email_address = 'mafurendiofficial@gmail.com';

  // Check if the form was submitted
  if (isset($_POST['submit'])) {
    // Validate the input fields
    $name = trim($_POST['name']); // Remove whitespace
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL); // Validate email format
    $subject = trim($_POST['subject']); // Remove whitespace
    $message = trim($_POST['message']); // Remove whitespace

    // Check if any field is empty or invalid
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
      // Display an error message
      echo "<p>Please fill in all the fields.</p>";
    } elseif ($email === false) {
      // Display an error message
      echo "<p>Please enter a valid email address.</p>";
    } else {
      // Include the PHP Email Form library
      if( file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php' )) {
        include( $php_email_form );
      } else {
        die( 'Unable to load the "PHP Email Form" Library!');
      }

      // Create a new PHP Email Form object
      $contact = new $PHP_Email_Form;
      $contact->ajax = true;
      
      // Set the email parameters
      $contact->to = $receiving_email_address;
      $contact->from_name = $name;
      $contact->from_email = $email;
      $contact->subject = $subject;

      // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
      /*
      $contact->smtp = array(
        'host' => 'example.com',
        'username' => 'example',
        'password' => 'pass',
        'port' => '587'
      );
      */

      // Add the message to the email body
      $contact->add_message( $message, 'Message');

      // Send the email and display the result
      echo $contact->send();
    }
  }
?>
