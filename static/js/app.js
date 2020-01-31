
$(document).ready(function(){
    var currYear = new Date().getFullYear();
    console.log(currYear);
    $('.datepicker').datepicker({
        defaultDate: new Date(),
        
        maxDate: new Date(),
        yearRange: [2012, currYear],
        format: "yyyy-mm-dd" 
    });

    var form_data = new FormData($('#upload-info')[0]);
    
    $("#search").on("change", function(){
        
        console.log($('#search').val());
        form_data.append('search', $('#search').val())
    });
    $("#calender_today").on("change", function(){
        console.log($('#calender_today').val());
        form_data.append('Date', $('#calender_today').val())
    });
    $("#money").on("change", function(){
        form_data.append('Totaltweets', $('#money').val())
        console.log($('#money').val());
    });
    
    console.log(form_data.values());
    var search_word = $('#search').val();
    
    /* Reset Page */
    $('#upload-reset-btn').click(function(e) {
        location.reload();
    });
    

    //$('#upload-input-btn').click(function(e) {
    $('form').on('submit', function(e){
        /* Start of form Validation */
        var search_term = $('#search').val();
        
        
        console.log('click')
        console.log($('#calender_today').val());
        $('.progress').show();
        $.ajax({
            type: 'POST',
            url: '/upload',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            success: function(data) {
                

                /* Create Lists in Card */
                data[0].forEach(createLists);
                function createLists(item, index) {
                    let tweetItem = document.createElement("P");
                    var tweetItemTextNode = document.createTextNode(item);
                    tweetItem.appendChild(tweetItemTextNode);
                    tweetItem.className = "card-content grey lighten-4";
                    document.getElementById('tweets').appendChild(tweetItem);
                }

                /* Toggle between displaying tweets and hiding them */
                $('#display_tweets_btn').click(function(e){
                    
                    
                    let hideTweets = document.getElementById('tweets');
                    
                    if (hideTweets.style.display === "none"){
                        hideTweets.style.display = "block";
                    }
                    else {
                        hideTweets.style.display = "none";
                    }
                    // e.stopPropagation();
                    
                    
                });
                
                /* Tweet Sentiment Segment*/
                
                let arr = Object.values(data[1]);
                function sent(item, index) {
                    if (item >= 0.05) {
                      return "positive"
                    }
                    else if (item > -0.05 && item < 0.05) {
                          return "neutral"
                    }
                      else {
                          return "negative"
                    }
                }
                var sentimentvalues = [];
                arr.forEach(e => sentimentvalues.push(sent(e)));
                var neg = sentimentvalues.filter(i => i === 'negative').length;
                var pos = sentimentvalues.filter(i => i === 'positive').length;
                var neu = sentimentvalues.filter(i => i === 'neutral').length;
                console.log(sentimentvalues);
                var canvas = document.getElementById("dataViz");
                var ctx = canvas.getContext('2d');

                // Global Options:
                Chart.defaults.global.defaultFontColor = 'dodgerblue';
                Chart.defaults.global.defaultFontSize = 16;

                // Data with datasets options
                var sentdata = {
                    labels: ["Negative Sentiment", "Positive Sentiment", "Neutral"],
                    datasets: [
                        {
                            label: "Sentiment Analysis of Tweets by Search Keyword("+search_term+")",
                            fill: true,
                            backgroundColor: [
                                'red',
                                'blue',
                                'orange'],
                            data: [neg, pos, neu]
                        }
                    ]
                };

                // Notice how nested the beginAtZero is
                var options = {
                    title: {
                        display: true,
                        text: 'Sentiment Analysis Report',
                        position: 'bottom'
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                };

                // Chart declaration:
                var myBarChart = new Chart(ctx, {
                    type: 'bar',
                    data: sentdata,
                    options: options
                });
                
                /* Toggle between hiding and showing reports */
                $('#display_wordcloud_btn').click(function(e){
                    
                    var hideTweets = document.getElementById('dataViz');
                    
                    if (hideTweets.style.display === "none"){
                        hideTweets.style.display = "block";
                    }
                    else {
                        hideTweets.style.display = "none";
                    }
                    e.stopPropagation();
                    
                    
                })
                $('#tweets').show();
                
            }
        }).done(function(data) {
            // Hide Progress bar
            $('.progress').hide();

            console.log(Object.values(data[1]));
        });
        e.preventDefault();
        
    })
    

});
