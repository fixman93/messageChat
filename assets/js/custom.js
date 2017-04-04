$( ".message-main .message-sidebar .header a, .new-message-box a" ).click(function() {
  $('.new-message-box').addClass("hidden");
  $('.message-to').removeClass("hidden");
  $('.message-content').addClass("hidden");
});
$( ".message-main .message-sidebar ul li, .navbar-nav .messages-status .dropdown-menu li" ).click(function() {
  $('.new-message-box').addClass("hidden");
  $('.message-to').addClass("hidden");
  $('.message-content').removeClass("hidden");
});


