<?php include "./includes/header.html" ?>
<?php include "./includes/sidebar.html" ?>

<section class="pink-bg wrapper"> 
  <div class="container-fluid" style="padding:20px;
  height: 230px;">
      <span class="title">Proxy</span>
      <span><a href="#"><button class="login-btn">Add Proxy</button></a></span>
      <div class="wrapper" style="padding-top: 15px;"> 
        <div class="column-3" style="border-left:6px solid #a351be;">
          <div class="left-content"> 
          <span style="font-size:13px">TOTAL PROXY</span><br>
          <span><h1 style="font-weight: 700;">10</h1></span>
          </div>
        </div>
        <div class="column-3" style="border-left:6px solid #3cc9e2;">
          <div class="left-content"> 
          <span style="font-size:13px">RUNNING PROXY</span><br>
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
        <a href="#"><button class="blue-btn">Remove All</button></a>
        <a href="#"><button class="blue-btn">Test Proxy</button></a>
      </div>
    </div>
  </div>
  <div class="container-fluid db-padding">
    <table width="100%" style="border-radius: 5px;background-color: #fff;border-radius: 10px;font-size: 12px;">
      <thead style="background-color: #f0f4f7;">
        <th scope="col">ID</th>
        <th scope="col">IP</th>
        <th scope="col">PORT</th>
        <th scope="col">USER</th>
        <th scope="col">PASSWORD</th>
        <th scope="col">TIME SINCE USED</th>
        <th scope="col">RESPONSE TIME</th>
      </thead>
      <tbody>
        <tr>
          <td>0</td>
          <td>152.33.230.14</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>1</td>
          <td>237.81.109.202</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>2</td>
          <td>237.81.109.202</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>3</td>
          <td>168.46.127.34</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>4</td>
          <td>41.39.76.219</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>5</td>
          <td>179.200.54.32</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>6</td>
          <td>33.102.39.33</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>7</td>
          <td>23.172.107.253</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>8</td>
          <td>23.172.107.253</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>9</td>
          <td>236.245.208.254</td>
          <td>7835</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
<?php include "./includes/footer.html" ?>