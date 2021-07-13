<?php include "./includes/header.html" ?>
<?php include "./includes/sidebar.html" ?>
<?php include "./includes/userform.html" ?>



<section class="pink-bg wrapper"> 
  <div class="container-fluid" style="padding:20px;
  height: 230px;">
      <span class="title">Users</span>
      <span><a href="#"><button class="login-btn" onclick="openUserForm()">Create New User</button></a></span>
      <div class="wrapper" style="padding-top: 15px;"> 
        <div class="column-3" style="border-left:6px solid #a351be;">
          <div class="left-content"> 
          <span style="font-size:13px">TOTAL USERS</span><br>
          <span><h1 style="font-weight: 700;">10</h1></span>
          </div>
        </div>
        <div class="column-3" style="border-left:6px solid #3cc9e2;">
          <div class="left-content"> 
          <span style="font-size:13px">USERS RUNNING WITH TASK</span><br>
          <span><h1 style="font-weight: 700;">2</h1></span>
          </div>
        </div>
      </div>
  </div>
</section>
<section class="main-section">
  <div class="container-fluid db-search">
    <div class="row">
      <div class="col-md-6">
        <input type="text" placeholder="Search">
      </div>
      <div class="col-md-6" style="display:flex; align-items:center; justify-content:flex-end;">
        <a href="#"><button class="blue-btn">Delete</button></a>
        <a href="#"><button class="blue-btn">Edit</button></a>
      </div>
    </div>
  </div>
  <div class="container-fluid db-padding">
    <table width="100%" style="border-radius: 5px;background-color: #fff;border-radius: 10px;font-size: 12px;">
      <thead style="background-color: #f0f4f7;">
        <th scope="col">USER NAME</th>
        <th scope="col">CARD HOLDER</th>
        <th scope="col">CARD</th>
        <th scope="col">EXPIRATION</th>
        <th scope="col">CVV</th>
      </thead>
      <tbody>
          <tr>
              <td>User 1</td>
              <td>First Name, Last Name</td>
              <td>...4564</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 2</td>
              <td>First Name, Last Name</td>
              <td>...4242</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 3</td>
              <td>First Name, Last Name</td>
              <td>...7891</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 4</td>
              <td>First Name, Last Name</td>
              <td>...7412</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 5</td>
              <td>First Name, Last Name</td>
              <td>...4564</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 6</td>
              <td>First Name, Last Name</td>
              <td>...4242</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 7</td>
              <td>First Name, Last Name</td>
              <td>...7891</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 8</td>
              <td>First Name, Last Name</td>
              <td>...7412</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 9</td>
              <td>First Name, Last Name</td>
              <td>...4564</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
          <tr>
              <td>User 10</td>
              <td>First Name, Last Name</td>
              <td>...4242</td>
              <td>12/27</td>
              <td>123</td>
          </tr>
      </tbody>
    </table>
  </div>
</section>
<?php include "./includes/footer.html" ?>