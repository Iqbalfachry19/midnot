document.addEventListener("DOMContentLoaded", function (event) {
  document.querySelector(".button").disabled = true;

  document.querySelector(".input").addEventListener("keyup", stateHandle);
});
function stateHandle(event) {
  if (event.target.value === "") {
    document.querySelector(".button").disabled = true;
    document.querySelector(".button").classList.remove("btn_join");
    document.querySelector(".button").classList.add("btn_disabled");
  } else {
    document.querySelector(".button").disabled = false;
    document.querySelector(".button").classList.remove("btn_disabled");
    document.querySelector(".button").classList.add("btn_join");
  }
}
