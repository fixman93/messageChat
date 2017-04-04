

var conn = null;

window.addEventListener("load", function(){
    conn = new Strophe.Connection("http://localhost:5280/http-bind");
    conn.connect(localStorage.getItem("username") + '@localhost', localStorage.getItem("password"), OnConnectionStatus);
}, false);

OnConnectionStatus = function(nStatus)
{
    if (nStatus == Strophe.Status.ERROR) 
    {
        alert("Unknown Error Occured");
    }
    else if (nStatus == Strophe.Status.CONNECTED) 
    {
        connected();

    }
    else if (nStatus == Strophe.Status.AUTHFAIL) 
    {
        alert("Authentication Failure. Please check username and password");
    }
    else if (nStatus == Strophe.Status.DISCONNECTED) 
    {
        var timer = setInterval(function(){
            if(conn.connected == false)
            {
                conn.connect(conn.jid, conn.pass, function(nStatus){
                    if (nStatus == Strophe.Status.CONNECTED) 
                    {
                        conn.send($pres());
                    }
                });
            }
            else
            {
                clearInterval(timer);
            }
        }, 3000);
    }
}

//register handlers
connected = function ()
{
    
    //get all the friends from friends list
    conn.roster.get(get_friends, 0);
    
        //handle when someone sends us a friend requests
    conn.addHandler(subscribeStanza, null, "presence", "subscribe");
   
    //when someone accepts our friend request
    conn.addHandler(subscribedStanza, null, "presence", "subscribed");
    
    //someone who had earlier accepted your friend request now removed you from their contact list 
    conn.addHandler(unsubscribeStanza, null, "presence", "unsubscribe");
    
    //handle when user comes online
    conn.addHandler(status_changed_available, null, "presence");

    //handle when user comes online
    conn.addHandler(status_changed_unavailable, null, "presence", "unavailable");
    
    //handle when someone sends us a message
    conn.addHandler(message_received, null, "message", "chat");
    
    //send your status to all other users.
    conn.send($pres()); 
}



get_friends = function (items)
{
    if(items != undefined)
    {
        if (items.length != 0)
        {
            var html_friends_list = "";
            var html_message_boxes = "";
            for(var count = 0; count < items.length; count++)
            {
                if(items[count].subscription == "both")
                {
                    var display_name = Strophe.getNodeFromJid(items[count].jid);

                    html_friends_list = html_friends_list + "<li id='open_chat_box_list_item" + items[count].jid + "'>" + "<a href='javascript:open_chat_box(\"" + items[count].jid + "\")'> <img src='https://remote.com/assets/images/avatar.png'> <div class='user-info-status'><div class='clearfix'><div class='pull-left'><h4>" + display_name + " <span class='block-list-label' id='" + items[count].jid  + "_unread_messages" + "'>0</span></h4></div><div class='pull-right'><span>12:38pm <span class='block-list-label' id='" + items[count].jid  + "_change_status" + "'></span></span></div></div><p>Hello my friend! Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></a></li>";

                    html_message_boxes = html_message_boxes + '<div style="display: none" class="message-content" id="';
                    html_message_boxes = html_message_boxes + items[count].jid + '_message_box"><div class="message-content-middle">'; 
                    html_message_boxes = html_message_boxes + '<ul id="' + items[count].jid + 'message_box_text' + '">';
                    html_message_boxes = html_message_boxes + '';
                    html_message_boxes = html_message_boxes + '</div><div class="message-input grid-content collapse shrink"><span class="inline-label">';
                    html_message_boxes = html_message_boxes + '<input type="text" id="' + items[count].jid + "_input" + '" placeholder="Message"><button class="button" onclick="send_message(\''+ items[count].jid + '\')">Send</button>';
                    html_message_boxes = html_message_boxes + '</span></ul></div></div>';
                    $('#message-contents').css('display','block!important')
                }
            }

            document.getElementById("message_boxes").innerHTML = html_message_boxes;
            document.getElementById("friends-list").innerHTML = html_friends_list;
        }
    }
}

var online_users = [];


status_changed_unavailable = function (stanza)
{
    try
    {
        var from = $(stanza).attr('from');
        var type = $(stanza).attr('type');
        var jid = Strophe.getBareJidFromJid(from);

        if(jid != Strophe.getBareJidFromJid(conn.jid))
        {
            
            var index = online_users.indexOf(jid);
            if (index > -1) 
            {
                online_users.splice(index, 1);
            }

            index = online_users.indexOf(jid);
            if(index > -1)
            {
               document.getElementById(jid  + "_change_status").innerHTML = "";
            }
            else
            {

                document.getElementById(jid  + "_change_status").innerHTML = "";
            }
        }
    }
    catch(e){}
    

    return true;
}

status_changed_available = function (stanza)
{   
    try
    {
        var from = $(stanza).attr('from');
        var type = $(stanza).attr('type');
        var jid = Strophe.getBareJidFromJid(from);

        if(jid != Strophe.getBareJidFromJid(conn.jid))
        {
            
            /* Multi User Chat Presense */

            var conference = from.indexOf("@conference.localhost");
            if(conference > -1)
            {
                var muc_name = Strophe.getNodeFromJid(from);block-list-label
                var muc_person_name = from.split("/")[1];
    
                if(type == undefined)
                {
                    alert(muc_person_name + " has joined group '" + muc_name + "'");
                }

                return true;
            }

            /* Multi User Chat Presense Ends */
            
            if(type == undefined)
            {
                online_users[online_users.length] = jid;
                document.getElementById(jid  + "_change_status").innerHTML = "<i class='fa fa-circle' aria-hidden='true'></i>";
            }
        }
    }
    catch(e)
    {console.log(e);}
    

    return true;
}

subscribeStanza = function (stanza)
{  
    var from_id = stanza.getAttribute("from");

    //have u already sent subscribe
    var item = conn.roster.findItem(from_id);
    if(item != false)
    {
        if(item.subscription == "to")
        {
            conn.send($pres({ to: from_id, type: "subscribed" }));
            return true;
        }    
    }
    //


    if (confirm(from_id + " has sent you friend request. Do you want to accept?") == true) 
    {
        conn.send($pres({ to: from_id, type: "subscribed" }));
        conn.send($pres({ to: from_id, type: "subscribe" }));
    }
    else
    {
        conn.send($pres({ to: from_id, type: "unsubscribed" }));
    }

    return true;
}

subscribedStanza = function (stanza)
{
    var from_id = stanza.getAttribute("from");
    new_friend_added(from_id);

    alert("You and " + from_id + " are now friends");

    return true;
}

unsubscribeStanza = function (stanza)
{
    var from_id = stanza.getAttribute("from");
    conn.send($pres({ to: from_id, type: "unsubscribe" }));
    alert("You and " + from_id + " are not friends anymore");

    friend_removed(from_id);

    return true;
}

remove_friend = function ()
{
    var person_name = prompt("Please enter the name");
    if (person_name != null) 
    {
        person_name = person_name + "@localhost";
        conn.send($pres({ to: person_name, type: "unsubscribe" }));
    }
    
}

//send friend request
add_friend = function ()
{
    var person_name = document.getElementById("search-friend").value;
    if (person_name != null) 
    {
        person_name = person_name + "@localhost";
        conn.send($pres({ to: person_name, type: "subscribe" }));
    }
}

new_friend_added = function (jid)
{
    var display_name = Strophe.getNodeFromJid(jid);
    
    var html_friends_list = "";
    html_friends_list = html_friends_list + "<li id='open_chat_box_list_item" + jid + "'>" + "<a href='javascript:open_chat_box(\"" + jid + "\")'>" + display_name + "<span class='block-list-label' id='" + jid  + "_unread_messages" + "'>0</span><span class='block-list-label' id='" + jid  + "_change_status" + "'></span></a></li>";
    document.getElementById("friends-list").innerHTML = document.getElementById("friends-list").innerHTML + html_friends_list;

    var html_message_boxes = "";

    html_message_boxes = html_message_boxes + '<div style="display: none" class="grid-block small-12 medium-12 vertical" id="';
    html_message_boxes = html_message_boxes +  jid + '_message_box"><div class="grid-content">'; 
    html_message_boxes = html_message_boxes + '<div id="' + jid + 'message_box_text' + '">';
    html_message_boxes = html_message_boxes + '</div>';
    html_message_boxes = html_message_boxes + '</div><div class="message-input grid-content collapse shrink"><span class="inline-label">';
    html_message_boxes = html_message_boxes + '<input type="text" id="' + jid + "_input" + '" placeholder="Message"><a href="" class="button" onclick="send_message(\''+ jid + '\')">Send</a>';
    html_message_boxes = html_message_boxes + '</span></div></div>';
    document.getElementById("message_boxes").innerHTML = document.getElementById("message_boxes").innerHTML + html_message_boxes;
}

friend_removed = function (jid)
{
    document.getElementById("open_chat_box_list_item" + jid).remove();
}

var current_open_chat_box = "";

open_chat_box = function (jid)
{
    if(current_open_chat_box == "")
    {
        var id = jid + '_message_box';
        document.getElementById(id).style.display = "block";
        current_open_chat_box = id;

        from = Strophe.getBareJidFromJid(jid); 
        document.getElementById(from + "_unread_messages").innerHTML = "0";
    }
    else
    {
        document.getElementById(current_open_chat_box).style.display = "none";
        var id = jid + '_message_box';
        document.getElementById(id).style.display = "block";
        current_open_chat_box = id;

        from = Strophe.getBareJidFromJid(jid); 
        document.getElementById(from + "_unread_messages").innerHTML = "0";
    }
}


message_received =  function (stanza)
{
    var from = $(stanza).attr('from');
    var type = $(stanza).attr('type');
    var jid = Strophe.getBareJidFromJid(from);
    var body = $(stanza).find('body').text();

    if(body)
    {
        from = Strophe.getBareJidFromJid(from); 
        var display_name = Strophe.getNodeFromJid(from);

        document.getElementById(from + "message_box_text").innerHTML = document.getElementById(from + "message_box_text").innerHTML + "<li><img src='https://remote.com/assets/images/avatar.png'><h4>" + display_name + "</h4><p>" + body + "</p></li>";

        if(from + "_message_box" != current_open_chat_box)
        {
            var total = document.getElementById(from + "_unread_messages").innerHTML;
            total = parseInt(total);
            total++;
            document.getElementById(from + "_unread_messages").innerHTML = total;
        }
    }

    return true;
}

//send message
send_message = function (to)
{
    var text = document.getElementById(to + "_input").value;
    var message = $msg({to: to, from: conn.jid, type: "chat"}).c("body").t(text);
    conn.send(message.tree());  
    document.getElementById(to + "message_box_text").innerHTML = document.getElementById(to + "message_box_text").innerHTML + "<li class='me'><img src='https://remote.com/assets/images/avatar.png'><h4>" + localStorage.getItem("username") + "</h4><p>" + text + "</p></li>";
}

