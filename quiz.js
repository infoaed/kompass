/*
  Quick quiz bootstrap extension
*/


;(function($) {

// keep track of number of quizes added to page
var quiz_count = 0;
var iter = 0;

// add jQuery selection method to create
// quiz structure from question json file
// "filename" can be path to question json
// or javascript object
$.fn.quiz = function(filename) {
  if (typeof filename === "string") {
    $.getJSON(filename, render.bind(this));
  } else {
    render.call(this, filename);
  }
};

// create html structure for quiz
// using loaded questions json
function render(quiz_opts) {


  // list of questions to insert into quiz
  var questions = quiz_opts.questions;

  // keep track of the state of correct
  // answers to the quiz so far
  var state = {
    answers : [],
    correct : 0,
    total : questions.length
  };

  var $quiz = $(this)
    .attr("class", "carousel slide")
    .attr("data-ride", "carousel");

  // unique ID for container to refer to in carousel
  var name = $quiz.attr("id") || "urban_quiz_" + (++quiz_count);

  $quiz.attr('id', name);

  var height = $quiz.height();


  /*
    Add carousel indicators
  */


  /*
    Slides container div
  */
  var $slides = $("<div>")
    .attr("class", "carousel-inner")
    .attr("role", "listbox")
    .appendTo($quiz);

  /*
    Create title slide
  */
  var $title_slide = $("<div>")
    .attr("class", "item active")
    .attr("height", height + "px")
    .appendTo($slides);

  $('<h1>')
    .text(quiz_opts.title)
    .attr('class', 'quiz-title')
    .appendTo($title_slide);

  var $start_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($title_slide);

var $indicators = $('<ol>')
    .attr('class', 'progress-circles')

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Hakkame pihta!")
    .click(function() {
      $quiz.carousel('next');
      $indicators.addClass('show');

    $(".active .quiz-button.btn").each(function(){
      console.log(this.getBoundingClientRect())
      $(this).css("margin-left", function(){
        return ((250 - this.getBoundingClientRect().width) *0.5) + "px"
      })
    })



    })
    .appendTo($start_button);

  $indicators
    .appendTo($quiz);

  $.each(questions, function(question_index, question) {
    $('<li>')
      .attr('class', question_index ? "" : "dark")
      .appendTo($indicators);
  });

  /*
    Add all question slides
  */
  $.each(questions, function(question_index, question) {

    var last_question = (question_index + 1 === state.total);

    var $item = $("<div>")
      .attr("class", "item")
      .attr("height", height + "px")
      .appendTo($slides);
    var $img_div;
    if (question.image) {
      $img_div = $('<div>')
        .attr('class', 'question-image')
        .appendTo($item);
      $("<img>")
        .attr("class", "img-responsive")
        .attr("src", question.image)
        .appendTo($img_div);
      $('<p>')
        .text(question.image_credit)
        .attr("class", "image-credit")
        .appendTo($img_div);
    }
    $("<div>")
      .attr("class", "quiz-question")
      .html(question.prompt)
      .appendTo($item);

    var $answers = $("<div>")
      .attr("class", "quiz-answers")
      .appendTo($item);

    // if the question has an image
    // append a container with the image to the item


    // for each possible answer to the question
    // add a button with a click event
    $.each(question.answers, function(answer_index, answer) {

      // create an answer button div
      // and add to the answer container
      var ans_btn = $("<div>")
        .attr('class', 'quiz-button btn')
        .html(answer)
        .appendTo($answers);

      // This question is correct if it's
      // index is the correct index
      var correct = (question.correct.index === answer_index);

      // default opts for both outcomes
      var opts = {
        allowOutsideClick : false,
        allowEscapeKey : false,
        confirmButtonText: "Järgmine küsimus",
        html : true,
        confirmButtonColor: "#0096D2"
      };

      // set options for correct/incorrect
      // answer dialogue
      if (correct) {
        opts = $.extend(opts, {
          title: "Suurepärane suunataju!",
          text: (
            question.correct.text ?
            ("<div class=\"correct-text\">" +
              question.correct.text +
              "</div>"
            ) : ""),
          type: "success"
        });
      } else {
        opts = $.extend(opts, {
          title: "Ära lase end eksitada!",
          text: "<div class=\"correct-text\">" +
              question.correct.text +
              "</div>",
          type: "info"
        });
      }

      if (last_question) {
        opts.confirmButtonText = "Vaata tulemusi!";
      }
      
      
      // bind click event to answer button,
      // using specified sweet alert options
      ans_btn.on('click', function() {

        function next() {
          // if correct answer is selected,
          // keep track in total
          if (correct) state.correct++;
          state.answers[question_index] = answer_index;

          iter = 0;
          $quiz.carousel('next');

          // if we've reached the final question
          // set the results text
          if (last_question) {
            console.log(state.answers);

            /*$results_title.html(resultsText(state));
            $results_ratio.text(
              "Vastasid " +
              Math.round(100*(state.correct/state.total)) +
              "% küsimustest õigesti!"
            );*/
            $twitter_link.attr('href', tweet(state, quiz_opts));
            $facebook_link.attr('href', facebook(state, quiz_opts));
            $indicators.removeClass('show');
            // indicate the question number
            $indicators.find('li')
              .removeClass('dark')
              .eq(0)
              .addClass('dark');
 
          } else {
            // indicate the question number
            $indicators.find('li')
              .removeClass('dark')
              .eq(question_index+1)
              .addClass('dark');
          }
          // unbind event handler
          $('.sweet-overlay').off('click', next);
        }

        // advance to next question on OK click or
        // click of overlay
        swal(opts, next);
        $('.sweet-overlay').on('click', next);

      });

    });


  });

  // final results slide
  var $results_slide = $("<div>")
    .attr("class", "item")
    .attr("height", height + "px")
    .appendTo($slides);

  /*var $results_title = $('<h1>')
    .attr('class', 'quiz-title')
    .appendTo($results_slide);*/

  var $canvas = $('<div>')
    .attr('id', 'canvas')
    .appendTo($results_slide);
    
  var $results_ratio = $('<div>')
    .attr('class', 'results-ratio')
    .attr('id', 'res-text')
    .appendTo($results_slide);

  var $restart_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($results_slide);

  var $social = $("<div>")
    .attr('class', 'results-social')
    .html('<div id = "social-text">Tunned, et meie kompassist oli sulle kasu? Jaga siis väärt infot sõpradega!</div>')
    .appendTo($results_slide);

  var $twitter_link = $('<a>')
    .html('<span class="social social-twitter follow-tw"></span>')
    .appendTo($social);

  var $facebook_link = $('<a>')
    .html('<span class="social social-facebook follow-fb"></span>')
    .appendTo($social);

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Loe täpsemalt siit!")
    .click(function() {
      window.location.href = "http://piraadipartei.ee/kompassid";
      //state.correct = 0;
      //$quiz.carousel(0);
    })
    .appendTo($restart_button);

  $quiz.carousel({
    "interval" : false
  });

  $(window).on('resize', function() {
    $quiz.find(".item")
      .attr('height', $quiz.height() + "px");
  });

  result_viz();

}

function resultsText(state) {

  var ratio = state.correct / state.total;
  var text;

  switch (true) {
    case (ratio === 1):
      text = "Ajee, mida tulemust!";
      break;
    case (ratio > 0.9):
      text = "Suurepärane, sa panid peaaegu kõik täkkesse!";
      break;
    case (ratio > 0.60):
      text = "Päris hea, aga treeni veidi veel!";
      break;
    case (ratio > 0.5):
      text = "Üle poolte läksid täppi, lootust on!&hellip;";
      break;
    case (ratio < 0.5 && ratio !== 0):
      text = "Päris karm, mis? Tee väike paus ja mine uuele ringile!";
      break;
    case (ratio === 0):
      text = "Mitte ühtegi õiget &mdash; süsteemis on kallutatud jõud?";
      break;
  }
  return text;

}


function tweet(state, opts) {

  var body = (
    "Ei tea, keda valida? Vaata, mida soovitab sulle korrigeeritud kompass! " + opts.url + " #valimised #rk2019 #aiateibad"
  );

  return (
    "http://twitter.com/intent/tweet?text=" +
    encodeURIComponent(body)
  );

}

function facebook(state, opts) {
  return "https://www.facebook.com/sharer/sharer.php?u=" + opts.url;
}

function result_viz() {
    var width = 400, height = 360, centerGap = 15, n = 20;
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    var generateDataset = function(n, inner, outer) {
        var ls = [];
        for (var i = 0; i < n; i++) {
            ls.push({
                'inner': inner,
                'outer': getRandomInt(outer - 60, outer)
            });
        }
        return ls;
    }
    var colorRand = getRandomInt(0,3);
    if (colorRand==0) {
        var color = d3.scale.category20();
    } else if (colorRand==1) {
        var color = d3.scale.category20b();
    } else if (colorRand==2) {
        var color = d3.scale.category20c();
    }

    var dataset = generateDataset(n, centerGap, Math.min(width, height) / 2);
    var svg = d3.select("#canvas").append("svg").attr("width", width).attr("height", height);
    var arc = d3.svg.arc()
                    .innerRadius(function(d) {
                        return d.data.inner;
                    })
                    .outerRadius(function(d) {
                        return d.data.outer;
                    });

    var pie = d3.layout.pie()
                       .value(function(d) { return getRandomInt(10, 15); })
                       .sort(null);

    var randArc = d3.svg.arc()
                        .innerRadius(function(d) {
                            return d.data.inner;
                        })
                        .outerRadius(function(d) {
                            return getRandomInt(100, Math.min(width, height) / 2);
                        });

    var randomRotate = function() {
        var curAngle = getRandomInt(0,360);
        var rand = getRandomInt(0, 7);
        var easeFunc = 'cubic-in-out';
        if (rand == 0) {
            easeFunc = 'linear';
        } else if (rand == 1) {
            easeFunc = 'quad';
        } else if (rand == 2) {
            easeFunc = 'back';
        } else if (rand == 3) {
            easeFunc = 'elastic';
        } else if (rand == 4) {
            easeFunc = 'bounce';
        }
        svg.selectAll('path').transition()
                             .attr("d", function(d) {
                                 return randArc(d);
                             })
                             .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + curAngle + "," + 0 + "," + 0 + ")")
                             .duration(300)
                             .ease(easeFunc);

        $("#res-text").html(["Valimistulemus selgub", "100% juhtudest", "alles valimispäeval", "&nbsp;", "Viimase aasta jooksul", "on kaks valitsuserakonda", "käinud 5% künnise piiril", "&nbsp;", "Erakondliku eelistuseta", "on 21% valijatest", "&nbsp;", "Ära usu vildakaid kompasse!", "&nbsp;", "Informeeri ennast ise", "ja usalda oma südant!", "&nbsp;"][iter++%16]);
    }

    svg.selectAll('path')
       .data(pie(dataset))
       .enter()
       .append('path')
       .attr('d', function(d) {
           return arc(d);
       })
       .attr("stroke-width", 2)
       .attr("stroke", "black")
       .style("stroke-opacity", .3)
       .style("stroke-linejoin", "round")
       .attr('fill', function(d, i) {
           return color(i);
       })
       .style("opacity", .9)
       .attr('class', 'pie')
       .attr('transform', 'translate(250, 250)');
       
    setInterval(randomRotate, 1800);
}


})(jQuery);

