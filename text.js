var username = '';
var nameBox = document.querySelector('.nameBox');

console.log(document.querySelector('.submitbutton'));

document.querySelector('.submitbutton').addEventListener('click', function(event) {
  event.preventDefault();
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.response);
    }
  };
  xhr.open('POST', '/profilepage');
  xhr.send(nameBox.value);
})
