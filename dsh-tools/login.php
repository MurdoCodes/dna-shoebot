<!DOCTYPE html>
<html>
<head>
<script src="./assets/js/custom.js" type="text/javascript"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="./assets/css/styles.css">
<link rel="stylesheet" href="./assets/css/all.css">  
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap" rel="stylesheet">
<script src="https://use.fontawesome.com/6e51fbeae9.js"></script>
</head>
<body>
    <section class="login-container">
        <div class="login-wrapper">
            <div style="text-align:center;margin-bottom:40px;">
                <img src="./assets/images/dhs-white.png" alt="">
            </div>
            <div class="user-forms">
            <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">LOGIN</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">REGISTRATION</a>
            </li>
            </ul>
            <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
            <form>
            <div class="form-group">
                <label for="exampleInputEmail1">EMAIL</label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
            </div>
            <div class="form-group">
                <label for="exampleInputPassword1">PASSWORD</label>
                <input type="password" class="form-control" id="exampleInputPassword1">
            </div>
            <div style="display:flex;align-items:center">

            <button type="submit" class="btn login-btn">Register</button>
            <div style="text-decoration:underline;padding-left:20px;color:#8a92a2;font-weight:500;">
            Forgot password?
            </div>
            </form>
            </div>
</div>

            <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <form>
                <div class="form-group">
                    <label for="exampleInputEmail2">EMAIL</label>
                    <input type="email" class="form-control" id="exampleInputEmail2" aria-describedby="emailHelp">
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword2">PASSWORD</label>
                    <input type="password" class="form-control" id="exampleInputPassword2" placeholder="">
                </div>
                <div style="display:flex;align-items:center">

                <button type="submit" class="btn login-btn">Register</button>
                <div style="text-decoration:underline;padding-left:20px;color:#8a92a2;font-weight:500;">
                Forgot password?
                </div>
                </div>
                </form>
            </div>
            </div>
            </div>
        </div>
    </section>
</body>
</html>