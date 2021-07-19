<?php include "./includes/header.html" ?>
<?php include "./includes/sidebar.html" ?>
<?php include "./includes/taskform.html" ?>

<section class="pink-bg wrapper"> 
  <div class="container-fluid" style="padding:20px;
  height: 230px;">
      <span class="title">Task</span>
      <span><a href="#"><button class="login-btn" onclick="openTaskForm()">Create New Task</button></a></span>
      <div class="wrapper" style="padding-top: 15px;"> 
        <div class="column-3" style="border-left:6px solid #a351be;">
          <div class="left-content"> 
          <span style="font-size:13px">TOTAL TASK</span><br>
          <span><h1 style="font-weight: 700;">10</h1></span>
          </div>
        </div>
        <div class="column-3" style="border-left:6px solid #3cc9e2;">
          <div class="left-content"> 
          <span style="font-size:13px">RUNNING TASK</span><br>
          <span><h1 style="font-weight: 700;">2</h1></span>
          </div>
        </div>
        <div class="column-3" style="border-left:6px solid #8a8a8a;">
          <div class="left-content"> 
          <span style="font-size:13px">IDLE TASK</span><br>
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
        <a href="#"><button class="blue-btn">Start Task</button></a>
        <a href="#"><button class="blue-btn">Stop Task</button></a>
        <a href="#"><button class="blue-btn">Delete</button></a>
        <a href="#"><button class="blue-btn">Edit</button></a>
        <a href="#"><button class="blue-btn">Duplicate</button></a>
      </div>
    </div>
  </div>
  <div class="container-fluid db-padding">
    <table width="100%" style="border-radius: 5px;background-color: #fff;border-radius: 10px;font-size: 12px;">
      <thead style="background-color: #f0f4f7;">
        <th scope="col">ID</th>
        <th scope="col">CATEGORY</th>
        <th scope="col">PRODUCT NAME</th>
        <th scope="col">COLOR</th>
        <th scope="col">SIZE</th>
        <th scope="col">USER</th>
        <th scope="col">PROXY</th>
        <th scope="col">STATUS</th>
      </thead>
      <tbody>
          <tr>
              <td>0</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>8</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td>Connecting to the Site</td>
          </tr>
          <tr>
              <td>1</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>9</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td>Connecting to the Site</td>
          </tr>
          <tr>
              <td>2</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>10</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>3</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>11</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>4</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>8</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>5</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>9</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>6</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>10</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>7</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>8</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>8</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>9</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
          <tr>
              <td>9</td>
              <td>Category 1</td>
              <td>Kobe 6 Protro All-Star</td>
              <td>RED</td>
              <td>10</td>
              <td>User 1</td>
              <td>Proxy Name 1</td>
              <td></td>
          </tr>
      </tbody>
    </table>
  </div>
</section>
<?php include "./includes/footer.html" ?>