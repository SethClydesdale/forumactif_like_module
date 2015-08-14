$(function() {
  // General Configuration of the plugin
  var config = {
    position_left : true, // true for left || false for right
    negative_vote : true, // true for negative votes || false for positive only
    vote_bar : true, // display a small bar under the vote buttons
    
    // button config
    icon_plus : '<img src="http://i18.servimg.com/u/f18/18/21/41/30/plus10.png" alt="+"/>',
    icon_minus : '<img src="http://i18.servimg.com/u/f18/18/21/41/30/minus10.png" alt="-"/>',
    
    // language config
    title_plus : 'Like %{USERNAME}\'s post',
    title_minus : 'Dislike %{USERNAME}\'s post',
    
    title_like_singular : '%{VOTES} person likes %{USERNAME}\'s post',
    title_like_plural : '%{VOTES} people like %{USERNAME}\'s post',
    
    title_dislike_singular : '%{VOTES} person dislikes %{USERNAME}\'s post',
    title_dislike_plural : '%{VOTES} people dislike %{USERNAME}\'s post',
    
    title_vote_bar : '%{VOTES} people liked %{USERNAME}\'s post %{PERCENT}'
  },
      
      
  // function bound to the onclick handler of the vote buttons
  submit_vote = function() {
    var next = this.nextSibling, // the counter next to the vote button that was clicked
        box = this.parentNode,
        bar = box.getElementsByTagName('DIV'),
        vote = box.getElementsByTagName('A'),
        mode = /eval=plus/.test(this.href) ? 1 : 0,
        i = 0, j = vote.length, pos, neg, major, minor, percent;
    
    // submit the vote asynchronously
    $.get(this.href, function() {
      next.innerHTML = +next.innerHTML + 1; // add to the vote count
      next.title = next.title.replace(/(\d+)/, function(M, $1) { return +$1 + 1 });
      
      pos = +vote[0].nextSibling.innerHTML;
      neg = vote[1] ? +vote[1].nextSibling.innerHTML : 0;
      percent = pos == 0 ? '0%' : pos == neg ? '50%' : Math.round(pos / (pos + neg) * 100) + '%';
      
      if (bar[0]) {
        bar[0].style.display = '';
        bar[0].firstChild.style.width = percent;
        box.title = box.title.replace(/\d+\/\d+/, pos + '/' + ( pos + neg )).replace(/\(\d+%\)/, '(' + percent + ')');
      }
    });
    
    // revoke voting capabilities on the post once the vote is cast
    for (; i < j; i++) {
      vote[i].href = '#';
      vote[i].className = vote[i].className.replace(/fa_vote/, 'fa_voted');
      vote[i].onclick = function() { return false };
    }
     
    return false;
  },
      
  vote = $('.vote'), i = 0, j = vote.length,
  version = $('.bodylinewidth')[0] ? 0 : document.getElementById('wrap') ? 1 : $('.pun')[0] ? 2 : document.getElementById('ipbwrapper') ? 3 : 'badapple', // version check
  
  // version data so we don't have to redefine these arrays during the loop
  vdata = {
    tag : ['SPAN', 'LI', 'SPAN', 'LI'][version],
    name : ['.name', '.postprofile dt > strong', '.username', '.popmenubutton'][version],
    actions : ['.post-options', '.profile-icons', '.post-options', '.posting-icons'][version],
  },
  
  post, plus, minus, n_pos, n_neg, title_pos, title_neg, li, ul, bar, button, total, percent, span, pseudo, vote_bar; // startup variables for later use in the loop
  
  // prevent execution if the version cannot be determined
  if (version == 'badapple') {
    if (window.console) console.warn('This plugin is not optimized for your forum version. Please contact the support for further assistance.');
    return;
  }
  
  for (; i < j; i++) {
    post = $(vote[i]).parentsUntil('.post').parent()[0];
    bar = $('.vote-bar', vote[i])[0]; // vote bar
    button = $('.vote-button', vote[i]); // plus and minus buttons
    pseudo = $(vdata.name, post).text() || 'MISSING_STRING'; // username of the poster
    ul = $(vdata.actions, post)[0]; // post actions
    li = document.createElement(vdata.tag); // vote system container
    li.className = 'fa_reputation';
    
    if (li.tagName == 'SPAN') li.style.display = 'inline-block';
    
    // calculate votes
    if (bar) {
      total = +bar.title.replace(/.*?\((\d+).*/, '$1');
      percent = +bar.title.replace(/.*?(\d+)%.*/, '$1');
      
      n_pos = Math.round(total * (percent / 100));
      n_neg = total - n_pos;
    } else {
      n_pos = 0;
      n_neg = 0;
    }
    
    // set up negative and positive titles with the correct grammar, votes, and usernames
    title_pos = (n_pos == 1 ? config.title_like_singular : config.title_like_plural).replace(/%\{USERNAME\}/g, pseudo).replace(/%\{VOTES\}/g, n_pos);
    title_neg = (n_neg == 1 ? config.title_dislike_singular : config.title_dislike_plural).replace(/%\{USERNAME\}/g, pseudo).replace(/%\{VOTES\}/g, n_neg);
    
    // define the vote counts
    li.innerHTML = '<span class="fa_count fa_positive" title="' + title_pos + '">' + n_pos + '</span>' + (config.negative_vote ? '&nbsp;<span class="fa_count fa_negative" title="' + title_neg + '">' + n_neg + '</span>' : '');
    span = li.getElementsByTagName('SPAN'); // get the vote count containers for use as insertion points
    
    // create positive vote button
    plus = document.createElement('A');
    plus.href = button[0] ? button[0].firstChild.href : '#';
    plus.onclick = button[0] ? submit_vote : function() { return false };
    plus.className = 'fa_vote' + (button[0] ? '' : 'd') + ' fa_plus';
    plus.innerHTML = config.icon_plus;
    plus.title = (button[0] ? config.title_plus : title_pos).replace(/%\{USERNAME\}/g, pseudo);
    
    span[0] && li.insertBefore(plus, span[0]);
    
    // create negative vote button
    if (config.negative_vote) {
      minus = document.createElement('A');
      minus.href = button[1] ? button[1].firstChild.href : '#';
      minus.onclick = button[1] ? submit_vote : function() { return false };
      minus.className = 'fa_vote' + (button[1] ? '' : 'd') + ' fa_minus';
      minus.innerHTML = config.icon_minus;
      minus.title = (button[1] ? config.title_minus : title_neg).replace(/%\{USERNAME\}/g, pseudo);
      
      span[1] && li.insertBefore(minus, span[1]);
    }
    
    // create vote bar
    if (config.vote_bar) {
      vote_bar = document.createElement('DIV');
      vote_bar.className = 'fa_votebar';
      vote_bar.innerHTML = '<div class="fa_votebar_inner" style="width:' + percent + '%;"></div>';
      vote_bar.style.display = bar ? '' : 'none';
      li.title = config.title_vote_bar.replace(/%\{USERNAME\}/, pseudo).replace(/%\{VOTES\}/, n_pos + '/' + (n_pos + n_neg)).replace(/%\{PERCENT\}/, '(' + percent + '%)');
      li.appendChild(vote_bar);
    }
    
    // finally insert the vote system and remove the default one
    config.position_left ? ul.insertBefore(li, ul.firstChild) : ul.appendChild(li);
    vote[i].parentNode.removeChild(vote[i]);
  }
});
