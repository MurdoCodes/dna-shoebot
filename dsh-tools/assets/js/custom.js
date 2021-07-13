function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}
  
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}

function openUserForm() {
  document.getElementById("mysideForm").style.width = "580px";
}
  
function closeUserForm() {
  document.getElementById("mysideForm").style.width = "0";
}

function openTaskForm() {
  document.getElementById("mytaskForm").style.width = "580px";
}
  
function closeTaskForm() {
  document.getElementById("mytaskForm").style.width = "0";
}

  (function () {
    ('#datetimepicker1').datetimepicker();
});