/**
 * @author: Manolo Alvarez
 * @lastRevised: 03/06/2020
 * @summary: Javascript file that runs the representatives page
 */

// Clear Storage
localStorage.clear();

//////////////// HTML elements and variables////////////////////////////////
const list = document.getElementById('list')
const pagination_element = document.getElementById('pagination');
let current_page = 1;
let rows = 5;
let cols = 4;
let cardWidth = 285;

 //////////////////// Get Representatives from DB ///////////////////////////

var xhttp = new XMLHttpRequest();
xhttp.open('GET', 'https://reflected-flux-270220.appspot.com/politicians/congressman', false);
xhttp.send();

// we write the entire object logic as private members and
// expose an anonymous object which maps members we wish to reveal
// to their corresponding public members
var repsCollection = (function() {
    // private members
    var allReps = JSON.parse(xhttp.responseText);
    representatives = allReps;

    function replaceCollection(objects){
      representatives = objects;
    }

    function addRep(object) {
      representatives.push(object);
    }

    function removeRep(object) {
      var index = objects.indexOf(object);
      if (index >= 0) {
          representatives.splice(index, 1);
      }
    }

    function getReps() {
      return JSON.parse(JSON.stringify(representatives));
    }

    function getAllReps() {
      return JSON.parse(JSON.stringify(allReps));
    }

    // public members
    return {
      replaceCollection: replaceCollection,
      addRep: addRep,
      removeRep: removeRep,
      getReps: getReps,
      getAllReps: getAllReps
    };
})();


/////////////////////////// Set-up Page /////////////////////////////////////
{
  let repsPage = new PoliticiansPage(repsCollection.getReps(), pagination_element, current_page, rows, cols);
  repsPage.setupPagination();
  repsPage.displayList();
}



////////////////////////////// Sort By //////////////////////////////////////
{
var sort = document.getElementById("sort");
sort.addEventListener("change", function() {
    var sortOption = sort.getElementsByTagName('option')[sort.selectedIndex].value;

    representatives = repsCollection.getReps();

    if (sortOption === 'last name') representatives.sort((a,b) => (a.last_name > b.last_name) ? 1 : ((b.last_name > a.last_name) ? -1 : 0));
    if (sortOption === 'first name') representatives.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
    if (sortOption === 'state') representatives.sort((a,b) => (a.state > b.state) ? 1 : ((b.state > a.state) ? -1 : 0));
    if (sortOption === 'district') representatives.sort((a,b) => (a.district > b.district) ? 1 : ((b.district > a.district) ? -1 : 0));

    SetupPagination(representatives, pagination_element, rows, cols);
    DisplayList(representatives, rows, cols, current_page);
});
}

////////////////////////////// Search Bar ////////////////////////////////////
{
const searchBar = document.forms['searchBar'].querySelector('input');
searchBar.addEventListener('keyup', function(e){
  if(!(e.key === 'Enter')){
    const select = document.getElementById('select');
    var option = select.getElementsByTagName('option')[select.selectedIndex].value;
    const phrase = e.target.value.toLowerCase();
    repsCollection.replaceCollection(repsCollection.getAllReps().filter(function(rep){
      var content = null;

      if (option === 'name') content = rep.first_name.toLowerCase() + rep.last_name.toLowerCase();
      if (option === 'state') content = rep.state.toLowerCase();
      if (option === 'district') return rep.district.toLowerCase() === phrase;
      if (option === 'party') content = rep.party.toLowerCase();

      return content.includes(phrase);
    }));
  } else{
    e.target.value = "";
    SetupPagination((repsCollection.getReps()), pagination_element, rows, cols);
    DisplayList(repsCollection.getReps(), rows, cols, current_page);
  }
});
}
////////////////////////////// Functions /////////////////////////////////////
function DisplayList (representatives, rows_per_page, cols_per_page, page) {
	document.getElementById('list').innerHTML = "";
	page--;

  console.log(representatives);

	let start = rows_per_page * cols_per_page * page;
	let end = start + rows_per_page * cols_per_page;

  for (let i = start; i < representatives.length && i<end; i+=4) {
      const row = document.createElement('div');
      var rowWidth = 4*cardWidth;
      if(representatives.length-i < 4) rowWidth = cardWidth*(representatives.length-i);
      row.setAttribute('class', 'row');
      row.setAttribute('style', `margin-top:50px; width:${rowWidth}px`)

    for(let j = i; j < representatives.length && j<end && j<(i+4); j++){
      const card = document.createElement('div');
      const image = document.createElement('div');
      const cardBody = document.createElement('div');
      const bodyTitle = document.createElement('div');
      const bodyParagraph = document.createElement('div');
      const cardFooter = document.createElement('div');
      const head1 = document.createElement('h3');
      const head2 = document.createElement('h3');
      const attribute1 = document.createElement('h6');
      const attribute2 = document.createElement('a');
      const attribute3 = document.createElement('p');
      const bioPage = document.createElement('a');
      const img = document.createElement('img');

      card.setAttribute('class' , 'card');
      card.setAttribute('style' , 'width: 255px');
      image.setAttribute('style' , 'width: 255px; height: 225px;');
      cardBody.setAttribute('id', 'cardBody');
      cardBody.setAttribute('class', 'card-body');
      bodyTitle.setAttribute('id', 'bodyTitle');
      bodyTitle.setAttribute('style', 'height: 74.66px; vertical-align: middle; text-align: center;');
      bodyParagraph.setAttribute('id', 'bodyParagraph');
      bodyParagraph.setAttribute('style', 'height: 74.66px; vertical-align: middle; text-align: center;');
      cardFooter.setAttribute('id', 'cardFooter');
      cardFooter.setAttribute('class', 'card-footer');
      cardFooter.setAttribute('style', 'text-align: center;');
      head1.setAttribute('class', 'mb-0');
      head2.setAttribute('class', 'mb-0');
      attribute1.setAttribute('class', 'mb-0');
      attribute2.setAttribute('class', 'card-text mb-auto');
      attribute2.setAttribute('href', 'state_overview.html');
      attribute2.setAttribute('onclick', `f1("${representatives[j].state}")`);
      attribute3.setAttribute('class', 'card-text mb-auto');
      bioPage.setAttribute('class', 'btn btn-primary');
      bioPage.setAttribute('id', `${representatives[j].id}`);
      bioPage.setAttribute('onclick', `store("${representatives[j].id}", "${representatives[j].first_name}",
      "${representatives[j].last_name}", "${representatives[j].party}", "${representatives[j].state}",
      "${representatives[j].district}", "${representatives[j].url}", "${representatives[j].twitter_account}",
      "${representatives[j].facebook_account}", "${representatives[j].youtube_account}", "${representatives[j].seniority}",
      "${representatives[j].next_election}", "${representatives[j].total_votes}", "${representatives[j].missed_votes}",
      "${representatives[j].total_present}", "${representatives[j].last_updated}", "${representatives[j].office}",
      "${representatives[j].phone}", "${representatives[j].fax}", "${representatives[j].missed_votes_pct}",
      "${representatives[j].votes_with_party_pct}", "${representatives[j].votes_against_party_pct}");`);
      bioPage.setAttribute('href', 'politiciansBio.html');
      bioPage.setAttribute('style', 'vertical-align: middle; ');
      img.setAttribute("class","w3-image");
      img.setAttribute('alt', 'Avatar')
      img.setAttribute('style', 'display: block; width: 175px; height: 225px; margin-left: auto; margin-right: auto; margin-top: 5px; border-radius: 50%;');

      head1.textContent = representatives[j].first_name;
      head2.textContent = representatives[j].last_name;
      attribute1.textContent = representatives[j].party;
      attribute2.textContent = representatives[j].state;
      attribute3.textContent = "District " + representatives[j].district;
      bioPage.textContent = "Biography";
      img.src= 'https://bioguideretro.congress.gov/Static_Files/images/photos/'+representatives[j].id.charAt(0)+'/'+representatives[j].id+'.jpg';


      row.appendChild(card);
      card.appendChild(image);
      card.appendChild(cardBody);
      card.appendChild(cardFooter);
      image.appendChild(img);
      cardBody.appendChild(bodyTitle);
      cardBody.appendChild(bodyParagraph);
      bodyTitle.appendChild(head1);
      bodyTitle.appendChild(head2);
      bodyParagraph.appendChild(attribute1);
      bodyParagraph.appendChild(attribute2);
      bodyParagraph.appendChild(attribute3);
      cardFooter.appendChild(bioPage);
      cardFooter.appendChild(document.createElement("p"));
    }
    list.appendChild(row);
  }
}

function SetupPagination (representatives, wrapper, rows_per_page, cols_per_page) {
	wrapper.innerHTML = "";
	let length = representatives.length;

	let page_count = Math.ceil(length / (rows_per_page*cols_per_page));
	for (let i = 1; i < page_count + 1; i++) {
		let btn = PaginationButton(i, representatives);
		wrapper.appendChild(btn);
	}
}

function PaginationButton (page, representatives) {
	let button = document.createElement('button');
	button.innerText = page;

	if (current_page == page) button.classList.add('active');

	button.addEventListener('click', function () {
		current_page = page;
		DisplayList(representatives, rows, cols, current_page);

		let current_btn = document.querySelector('.pagenumbers button.active');
		current_btn.classList.remove('active');

		button.classList.add('active');
	});

	return button;
}

function store(id, firstName, lastName, party, state, district, website,
  twitterHandle, facebookHandle, youtubeHandle, seniority, nextElection,
  totalVotes, missedVotes,totalPresent, lastUpdated, office, phone, fax,
  missedVotesPct, votesWithPartyPct, votesAgainstPartyPct){

  localStorage.setItem('politician_id', id);
  localStorage.setItem('politician_firstName', firstName);
  localStorage.setItem('politician_lastName', lastName);
  localStorage.setItem('politician_party', party);
  localStorage.setItem('politician_state', state);
  localStorage.setItem('politician_district', district);
  localStorage.setItem('politician_website', website);
  localStorage.setItem('politician_twitterHandle', twitterHandle);
  localStorage.setItem('politician_facebookHandle', facebookHandle);
  localStorage.setItem('politician_youtubeHandle', youtubeHandle);
  localStorage.setItem('politician_seniority', seniority);
  localStorage.setItem('politician_nextElection', nextElection);
  localStorage.setItem('politician_totalVotes', totalVotes);
  localStorage.setItem('politician_missedVotes', missedVotes);
  localStorage.setItem('politician_totalPresent', totalPresent);
  localStorage.setItem('politician_lastUpdated', lastUpdated);
  localStorage.setItem('politician_office', office);
  localStorage.setItem('politician_phone', phone);
  localStorage.setItem('politician_fax', fax);
  localStorage.setItem('politician_missedVotesPct', missedVotesPct);
  localStorage.setItem('politician_votesWithPartyPct', votesWithPartyPct);
  localStorage.setItem('politician_votesAgainstPartyPct', votesAgainstPartyPct);
};

function f1(state){
  localStorage.setItem('state', state);
}
