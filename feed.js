var feeds = document.getElementById('feeds');
var keywords = document.getElementById('keywords');
var sortBy = document.getElementById('sortBy');
var days = document.getElementById('days');
var feedUrl;
var keywords;
var data;
var filteredData;
var feedIndex = location.href.match(/\?feed=([0-9]*)/);

feedIndex = feedIndex && feedIndex.length >= 2 ? parseFloat(feedIndex[1]) : 0;
feeds.selectedIndex = feedIndex;
feeds.onchange = changeFeed;

function changeFeed() {
    const index = feeds.selectedIndex;
    location.href = 'feeds.html?feed=' + index;
}

const SORTS = {
    DATE_DESC: function (a, b) {
        if (a.date > b.date) {
            return -1;
        } else if (a.data === b.date) {
            return 0;
        }
        return 1;
    },

    DATE_ASC: function (a, b) {
        return SORTS.DATE_DESC(b, a); //opposite
    },
}

async function loadFeed() {
    feedUrl = feeds.options[feedIndex].innerHTML;
    document.getElementById('results').innerHTML = `Results Loading... <br /> <em>${feedUrl}</em>`;
    data = await (await fetch('http://amgapps.com/weatherchannel/tools/xml-to-json.php?url=' + encodeURIComponent(feedUrl))).json();

    data.channel.item.map(normalizeItem);


    applyFilter();
}


function applyFilter() {
    if(!data || !data.channel){
        return;
    }

    var terms = [];
    if (keywords.value) {
        terms = keywords.value.split(' ');
    }
    var maxAge = parseFloat(days.value || 365) * 24 * 60 * 60 * 1000;
    terms = terms.map(term => new RegExp(term, 'i'));

    filteredData = data.channel.item.filter((item) => {
        if (maxAge && item.age > maxAge) {
            return false;
        }
        if (terms && terms.length) {
            for (var i = 0; i < terms.length; i++) {
                if (!item.asText.match(terms[i])) {
                    return false;
                }
            }
        }
        return true;
    });

    filteredData.sort(SORTS[sortBy.options[sortBy.selectedIndex].value]);

    document.getElementById('results').innerHTML = filteredData.map(getItemHtml).join('\n');

    document.querySelector('.channel-title').innerHTML = toString(data.channel.title) || feedUrl;
    document.querySelector('.channel-description').innerHTML = toString(data.channel.description);
    document.querySelector('.channel-count').innerHTML = `${filteredData.length} of ${data.channel.item.length}`;

}

function toString(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value;
}

function normalizeItem(item) {
    const d = new Date(item.pubDate);
    item.dateString = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;

    item.asText = Object.values(item).toString();
    if (item.group) {
        item.video = item.group.content;
        item.thumbnail = item.group.thumbnail;
    } else if (item.content) {
        item.video = item.content;
        item.thumbnail = item.content.thumbnail;
    }
    item.description = toString(item.description);
    item.title = toString(item.title);
    item.keywords = toString(item.keywords);
    item.category = toString(item.category);


    item.date = d.getTime();
    item.age = Date.now() - item.date;

    return item;
}

function getItemHtml(data, i) {
    const d = new Date(data.pubDate);
    return `<article>
		<h2>${data.title} (${data.video['@attributes'].duration}s)</h2>
		
		<video 
			controls
			preload="none" 
			poster="${data.thumbnail['@attributes'].url.replace('_2c', '')}"
			src="${data.video['@attributes'].url}"></video>
			
		<p>
			<span>Date:</span>: 
			<time datatime=${data.pubDate}>
				${data.dateString}
			</time>
		</p>
		<p><span>Keywords:</span> ${data.keywords}</p>	
		<p><span>Category:</span> ${data.category}</p>
		<p><span>Downloads:</span> 
			<a target="_blank" href="${data.thumbnail['@attributes'].url}">Image</a>
			|
			<a target="_blank" href="${data.video['@attributes'].url}">Video</a>
		</p>
		<hr />
		<p>${data.description}</p>	
			
	</article>`;
}


loadFeed();

/*
    {
        "guid": "5025561",
        "title": "This Sport Takes Ice Skating to Extreme Heights",
        "description": "Ice Cross Downhill is one of skating's most extreme winter sports. Red Bull's Crashed Ice is part of their world championships where hundreds of skaters around the world compete for a chance to become a champion!",
        "category": "Lifestyle, Sports",
        "keywords": "Extreme Sports,adrenaline",
        "group": {
            "content": {
                "@attributes": {
                    "medium": "video",
                    "type": "video/mp4",
                    "url": "http://content.jwplatform.com/videos/hx9WrIrY-1280.mp4",
                    "duration": "180"
                }
            },
            "thumbnail": {
                "@attributes": {
                    "medium": "image",
                    "type": "image/jpg",
                    "url": "https://assets3.thrillist.com/v1/image/2809111/size/gn-gift_guide_variable_c_2x.jpg"
                }
            }
        },
        "pubDate": "2019-02-05T22:26:36Z",
        "asText": "5025561,This Sport Takes Ice Skating to Extreme Heights,Ice Cross Downhill is one of skating's most extreme winter sports. Red Bull's Crashed Ice is part of their world championships where hundreds of skaters around the world compete for a chance to become a champion!,Lifestyle, Sports,Extreme Sports,adrenaline,[object Object],2019-02-05T22:26:36Z"
    }

*/
