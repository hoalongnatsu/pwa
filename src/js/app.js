
var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

if ('Notification' in window) { 
  document.querySelectorAll('.enable-notifications').forEach((button) => {
    button.style.display = 'inline-block';
    button.addEventListener('click', () => {
      Notification.requestPermission((result) => {
        if (result === 'granted') {
          if ('serviceWorker' in navigator) {
            let registration;
            navigator.serviceWorker.ready.then((res) => {
              registration = res;
              return registration.pushManager.getSubscription();
            }).then(sub => {
              if (sub === null) {
                const vapidPublicKey = 'BIHbWfR5T3zwPJwKN7yarZgvp602zdcpA6RqTnQIvpjXO9xZOGykOPf14GURBLiO7bbFEqaiCnRkwFDXRiULshM';
                
                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                })
              } else {
                
              }
            }).then(newSub => {
              return fetch('https://newagent-7ca34.firebaseio.com/subscriptions.json', {
                method: 'POST',
                headers: {  
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSub)
              })
            }).then(res => {
              const options = {
                body: 'You successfully subscribed',
                actions: [
                  { action: 'confirm', title: 'Confirm' },
                  { action: 'cancel', title: 'Cancel' }
                ]
              }

              registration.showNotification('Successfully subscribed!', options);
              button.style.display = 'none';
            })
            .catch(err => console.log(err))
          }
        }
      })
    })
  })
}