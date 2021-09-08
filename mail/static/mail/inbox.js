document.addEventListener('DOMContentLoaded', function () {

  // By default, load the inbox
  load_mailbox('inbox');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send mail
  document.querySelector('#compose-form').addEventListener('submit', () => {

    event.preventDefault();
    send_email();

  });


});


function archive_mail(email, status) {

  fetch(`/emails/${email}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status
    })
  })
    .then(load_mailbox('inbox'))
}

function read_email(email) {

  // Hide mailbox
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-read').style.display = 'block';

  // mark mail as read
  fetch(`/emails/${email}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // get mail form API
  fetch(`/emails/${email}`)
    .then(response => response.json())
    .then(email => {

      // Render mail
      document.querySelector('#sender').innerHTML = `From: <b>${email.sender}</b>`;
      document.querySelector('#recipients').innerHTML = `To: <b>${email.recipients}</b>`;
      document.querySelector('#subject').innerHTML = `<h3>${email.subject}</h3>`;
      document.querySelector('#timestamp').innerHTML = `${email.timestamp}`;
      document.querySelector('#text').innerHTML = `${email.body}`;

      // Create archive/unarchive button
      // Check if mail is already archived
      if (email.archived == true) {
        var status_to_set = false;
        //document.querySelector('#archive-button').innerHTML = 'Unarchive';
      } else {
        var status_to_set = true;
        //document.querySelector('#archive-button').innerHTML = 'Archive';
      }

      document.querySelector('#archive-button').addEventListener('click', () => {
        console.log(email.id);
        archive_mail(email.id, status_to_set);

      });

      // Replay button

      document.querySelector('#replay-button').addEventListener('click', () => {

        alert('TODO')

      })

    });

}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
      read: false
    })
  })
    .then(response => response.json())
    .then(result => {
      // check if mail was send 
      if (result.error) {
        document.querySelector('#error').style.display = 'block';
        document.querySelector('#error').innerHTML = result.error;
        console.log(result);
      } else {
        alert(`${result.message}`);
        // redirect to sent mailbox
        load_mailbox('sent');
      }

    });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#error').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-read').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  console.log(`start`);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-read').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      // Ad mails to mailbox
      email.forEach(single_mail => {

        // Check which mailbox is displeyed, and set sender or recipiernt address
        if (mailbox == 'sent') {
          var user = single_mail.recipients;
        } else {
          var user = single_mail.sender;
        }

        // Create new mail on the list
        const element = document.createElement('div');
        // Add class to div
        if (single_mail.read == true) {
          element.classList.add("mail-read")
        } else {
          element.classList.add("mail-unread")
        }
        element.innerHTML =
          `<div>${single_mail.archived}</div>
          <div class="sender">${user}</div>
          <div class="subject">${single_mail.subject}</div>
          <div class="timestamp">${single_mail.timestamp}</div>`

        // add element to the list
        document.querySelector('#emails-view').append(element);

        // ad fucntion to open mail when its onclik
        element.addEventListener('click', () => read_email(single_mail.id));

      });

    });

}