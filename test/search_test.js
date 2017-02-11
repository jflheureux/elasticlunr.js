module('search', {
  setup: function () {
    var idx = new elasticlunr.Index;
    idx.addField('body');
    idx.addField('title');

    ;([{
      id: 'a',
      title: 'Mr. Green kills Colonel Mustard',
      body: 'Mr. Green killed Colonel Mustard in the study with the candlestick. Mr. Green is not a very nice fellow.',
      wordCount: 19
    },{
      id: 'b',
      title: 'Plumb waters green plant ',
      body: 'Professor Plumb has a green plant in his study',
      wordCount: 9
    },{
      id: 'c',
      title: 'Scarlett helps Professor',
      body: 'Miss Scarlett watered Professor Plumbs green plant while he was away from his office last week.',
      wordCount: 16
    },{
      id: 'd',
      title: 'title',
      body: 'handsome',
    },{
      id: 'e',
      title: 'title abc',
      body: 'hand',
    }]).forEach(function (doc) { idx.addDoc(doc); });

    this.idx = idx;

    this.testSearchReturnAllResults = function(query) {
      var results = this.idx.search(query);

      equal(results.length, 5);
    };

    this.testMultiSearchReturnAllResults = function(queries) {
      var results = this.idx.multiSearch(queries);

      equal(results.length, 5);
    };
  }
});

test('returning the correct results', function () {
  var results = this.idx.search('green plant');
  equal(results.length, 3);
  equal(results[0].ref, 'b');
});

test('search term not in the index', function () {
  var results = this.idx.search('foo');

  equal(results.length, 0);
});

test('one search term not in the index', function () {
  var results = this.idx.search('foo green')

  equal(results.length, 3);
})

test('search contains one term not in the index', function () {
  var results = this.idx.search('green foo');

  equal(results.length, 3);
});

test('search takes into account boosts', function () {
  var results = this.idx.search('professor');

  equal(results.length, 2);
  equal(results[0].ref, 'c');
});

test('search boosts exact matches', function () {
  var results = this.idx.search('title');

  equal(results.length, 2);
  equal(results[0].ref, 'd');
});

test('search skips on 0 boost fields', function () {
  var results = this.idx.search('plant', {fields: {title: {boost: 1}, body: {boost: 0}}});

  equal(results.length, 1);
  equal(results[0].ref, 'b');
});

test('empty search returns all results', function() {
  this.testSearchReturnAllResults('');
});

test('null search returns all results', function() {
  this.testSearchReturnAllResults(null);
});

test('undefined search returns all results', function() {
  this.testSearchReturnAllResults(undefined);
});

test('no search returns all results', function() {
  this.testSearchReturnAllResults();
});

test('two queries matching same results', function() {
  var results = this.idx.multiSearch([
    {
      query: 'plant'
    },
    {
      query: 'professor'
    }
  ]);

  equal(results.length, 2);
  equal(results[0].ref, 'b');
  equal(results[1].ref, 'c');
});

test('second query matching some of first query results', function() {
  var results = this.idx.multiSearch([
    {
      query: 'green'
    },
    {
      query: 'mustard'
    }
  ]);

  equal(results.length, 1);
  equal(results[0].ref, 'a');
});

test('first query matching some of second query results', function() {
  var results = this.idx.multiSearch([
    {
      query: 'mustard'
    },
    {
      query: 'green'
    }
  ]);

  equal(results.length, 1);
  equal(results[0].ref, 'a');
});

test('two queries matching different results', function() {
  var results = this.idx.multiSearch([
    {
      query: 'kills'
    },
    {
      query: 'scarlett'
    }
  ]);

  equal(results.length, 0);
});

test('empty queries array', function() {
  this.testMultiSearchReturnAllResults([]);
});

test('null queries array', function() {
  this.testMultiSearchReturnAllResults(null);
});

test('undefined queries array', function() {
  this.testMultiSearchReturnAllResults(undefined);
});

test('no queries array', function() {
  this.testMultiSearchReturnAllResults();
});