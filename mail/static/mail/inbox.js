document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = function () {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      })
    })
      .then(response => response.json())

    load_mailbox('sent');

    return false;
  }


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;



  // Load mails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(email => {

      // Ad mails to mailbox
      email.forEach(single_mail => {

        // Check which mailbox is displeyed, and set sender or recipiernt address
        if (mailbox == 'sent') {
          var user = single_mail.recipients;
        } else {
          var user = single_mail.sender;
        }

        document.querySelector('#emails-view').innerHTML +=
          `<div class="mail">
        <div class="sender">${user}</div>
        <div class="subject">${single_mail.subject}</div>
        <div class="timestamp">${single_mail.timestamp}</div>
        </div>`;
      });


    });
}