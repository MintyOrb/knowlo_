module.exports = function(app, db){

var shortid = require('shortid');

app.get('/api/tag/search/:text/:exclude?', search);
app.get('/api/tag/most', most);

// translation
app.get('/api/set/:setID/translation/', readTranslation);          // retrieve a translation of a set based on tag id and provided langauge code. If language not found, attempt a translation. Also returns tag core
app.put('/api/auth/set/:setID/translation/:uid', updateTranslation);    // update single set translation by ID | is /set/:setID superfluous? /setMeta/:uid instead?
app.post('/api/auth/set/:setID/translation/', createTranslation);       // create set translation based on language code and connect to set. Return resrouce core and new translation
app.delete('/api/auth/set/:setID/translation/:uid', deleteTranslation); // delete set translation by id | delete node or just relatinship??
// synonym
app.get('/api/set/:setID/synonym/', readSynonym);                // retrieve synonyms of a set based on set id and provided langauge code. If language not found, attempt translation? Also returns set core
app.put('/api/auth/set/:setID/synonym/:otherID', updateSynonym);    // TODO: this is really a merge... add set synonym by ID | is /set/:setID - copy any other sets and resource relationships
// app.put('/api/auth/set/:setID/synonym/:otherID/add', addSynonym);    // add tag by ID | is /set/:setID - don't copy any other sets and resource relationships
// ? don't need? app.post('/api/auth/set/:setID/synonym/', createSynonym);      // create set synonym based on language code and connect to set. Return resrouce core and new synonym
app.delete('/api/auth/set/:setID/synonym/:tagID', deleteSynonym); // delete tag synonym by id | delete node or just relatinship??
// groups
app.get('/api/set/:setID/group/', readGroup);                 // retrieve a tags groups of a tag based on tag id and provided langauge code. If language not found, attempt a group. Also returns tag core
app.put('/api/auth/set/:setID/group/:groupID', updateGroup);    // update single tag group by ID | is /tag/:tagID superfluous? /tagMeta/:uid instead?
// ? app.post('/api/auth/tag/:tagID/group/', createGroup);     // create tag group based on language code and connect to tag. Return resrouce core and new group
app.delete('/api/auth/set/:setID/group/:groupID', deleteGroup); // delete tag group by id | delete node or just relatinship??
// within
app.get('/api/set/:setID/within/', within);
app.put('/api/auth/set/:setID/within/:otherID', updateWithin);
app.delete('/api/auth/set/:setID/within/:otherID', deleteWithin);
// contains
app.get('/api/set/:setID/contains/', contains);
app.put('/api/auth/set/:setID/contains/:otherID', updateContains);
app.delete('/api/auth/set/:setID/contains/:otherID', deleteContains);

// app.get('/api/set/:ruid/meta/', getMeta); //
app.put('/api/auth/set/:sID/meta/:mID', tagMeta);
app.get('/api/set/:setID/meta/', getMeta);
app.get('/api/auth/set/:setID/meta/', memberGetMeta);

// core
app.get('/api/set', query);           // query sets based on provided set IDs
app.get('/api/set/:coreID/crossSection', crossSection);   // get crossSection sets
app.get('/api/set/:uid', read);    // read details of a single set and translation
app.get('/api/auth/set', query);           // query sets based on user details and provided set IDs - /set/query instaed?
app.put('/api/auth/tag/:uid', updateCore); // update a single resrouces core node data
app.post('/api/auth/set', create);         // create (or update, if present) a tag core and single translation node.
app.delete('/api/auth/set/:setID', deleteCore);   // delete tag core node and relationships....and translations?
app.put('/api/auth/set/:sID/:rID/newTopIcon', newTopIcon)

app.put('/api/god/name/:uid/:name', name);
function name(req, res){
  var cypher = "MATCH (n:translation {uid: {uid}}) set n.name={name}  return n "
   db.query(cypher, { name: req.params.name, uid: req.params.uid },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}
app.put('/api/god/order/:tagID/:order/:setID', order);
function order(req, res){
  var cypher = "MATCH (n {uid: {tagID}})-[r]-(s:synSet {uid: {setID}}) set r.order={order}  return n "
   db.query(cypher, {
     order: parseInt(req.params.order.trim()),
     tagID: req.params.tagID,
     setID: req.params.setID
   },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}
/*
████████ ███████ ██████  ███    ███
   ██    ██      ██   ██ ████  ████
   ██    █████   ██████  ██ ████ ██
   ██    ██      ██   ██ ██  ██  ██
   ██    ███████ ██   ██ ██      ██
*/
function query(req, res){

  req.query.exclude = req.query.exclude.concat(req.query.include) // don't return query tags with group

  var cypher="";
  var scale=""  // for uid of requested scale
  if(req.query.type=='none'){
    //  set by number of related tagged resources
   cypher = "MATCH (contentNode:resource)-[:TAGGED_WITH]->(searchSets:synSet) "
          + "WHERE searchSets.uid IN {searchSets} "
          + "WITH contentNode, COUNT(searchSets) as count "
          + "WHERE count = {searchTagsCount} "
          + "MATCH (set:synSet)<-[:TAGGED_WITH]-(contentNode), "
            + "(set:synSet)-[setR:IN_SET]-(:tag)-[:HAS_TRANSLATION {languageCode: {lang} }]->(translation:translation) "
          + "WHERE setR.order=1 AND NOT set.uid IN {ignoreTags} "
          + "RETURN distinct count(DISTINCT contentNode) AS connections, translation, set as tag, set.uid AS setID "
          + "ORDER BY connections DESC "
          // + "ORDER BY {orderby} {updown}"
          // + "SKIP {skip} "
          + "LIMIT {limit}";
  } else if("size disciplines time".indexOf(req.query.type) >-1){
    var scaleIDs={
      'size':'BJgVf2ZQYW',
      'disciplines':'Bylx_hVBa-',
      'time':'BJNgnDdk-'
    }
    scale=scaleIDs[req.query.type];
    cypher = "MATCH (n:synSet {uid:{scale}})<-[sizeR:IN_SET]-(size:synSet) "
          + "WITH size, sizeR "
          + "MATCH (size)<-[setR:IN_SET]-(t:tag)-[:HAS_TRANSLATION {languageCode: {lang} }]->(translation:translation) "
            + "WHERE setR.order=1 "
          + "RETURN translation, size as tag, size.uid AS setID, sizeR.order AS order "
          + "ORDER BY order "
  } else {
    // sets and the groups that contain them
     cypher = "MATCH (contentNode:resource)-[:TAGGED_WITH]->(b:synSet)-[:IN_SET*0..3]->(searchSets:synSet) "
            + "WHERE searchSets.uid IN {searchSets} "//AND b.uid IN {searchSets} "
            + "WITH contentNode, COUNT(searchSets) as scount "
            + "WHERE scount = {searchTagsCount} " // necessary to match resources with all included sets
            + "MATCH (set:synSet)<-[:TAGGED_WITH]-(contentNode) " // get all sets tagged to all resources tagged that are with sets in query
            + "WITH distinct set as s1, count(DISTINCT contentNode) AS connections "
            + "MATCH (s1)-[:IN_SET]->(s2:synSet), " // get sets 'containing' related sets
              + "(s1)-[s1R:IN_SET]-(:tag)-[:HAS_TRANSLATION {languageCode: {lang} }]->(s1translation:translation), " // get translation
              + "(s2)-[s2R:IN_SET]-(:tag)-[:HAS_TRANSLATION {languageCode: {lang} }]->(s2translation:translation) " // get translation
            + "WHERE s1R.order=1 AND s2R.order=1 AND NOT s2.uid IN {ignoreTags} " // only top synonym and don't include search tags
            + "WITH s2, s2translation, collect({tag: s1, translation: s1translation, setID:s1.uid, connections:connections}) as contains  "
            + "RETURN COLLECT(distinct{tag:s2, translation: s2translation, setID:s2.uid}) AS group, contains, size(contains) as numInGroup  "
            + "ORDER BY numInGroup DESC "
            + "LIMIT {limit}"
            // + "SKIP {skip} "
            // + "LIMIT {limit}";// necessary?
  }

  var len = 0;
  if(req.query.include && req.query.include !== 'undefined'){
    len = req.query.include.length;
  } else { // maybe just don't send a get you know won't return anything...
    req.query.include =[];
  }
  db.query(cypher, {
    searchSets: req.query.include,
    ignoreTags: req.query.exclude,
    scale: scale,
    searchTagsCount: len,
    lang: 'en',
    limit: parseInt(req.query.limit) || 10,
    skip: parseInt(req.query.skip) || 0
  },function(err, result) {
    if (err) console.log(err);
    res.send(result)
  })
}

// using any tag uid for cross section
// returns object with two arrays or array of objects
function crossSection(req, res){
  var cypher = "MATCH (coreSet:synSet {uid: {coreID} })<-[r:IN_SET]-(member:synSet) "
             + "WITH r, collect(distinct member) AS members "
             + "UNWIND members AS member "
             + "OPTIONAL MATCH (memTrans:translation)<-[memLang:HAS_TRANSLATION]-(memTag:tag)-[memR:IN_SET]->(member)<-[IN_SET]-(inMembers:synSet)<-[inR:IN_SET]-(inTag:tag)-[inLang:HAS_TRANSLATION]->(inTrans:translation)  "
             + "WHERE "
             + "memLang.languageCode IN [ {language} , 'en' ] AND memR.order=1  "
             + "AND inLang.languageCode IN [ {language} , 'en' ] AND inR.order=1  "
             + "WITH r, member, memTrans, COLLECT({tag: inMembers, translation: inTrans, setID: inMembers.uid}) AS contains "
             // TODO: where inMebmer->ids of filter tag (ex just concepts)
             + "RETURN DISTINCT r, COLLECT({setID: member.uid, translation: memTrans, tag: member}) AS group,  "
             + "contains "
             + "ORDER BY  r.order"
  db.query(cypher, {coreID: req.params.coreID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

/**
* reads tag core node and translation
* language code passed via member as "member.languageCode" on body, default to english
* @param {String} languageCode
* @param {String} id will try to match on translation name of language provided and retrieve tag id
* @param {Number} id
* @return {Object} resource
*/
function read(req, res){
  // if(req.params.uid==='undefined' && req.params.name){
  //   var uid = req.params.name; // match tag on name
  //   var cypher = "MATCH (tag:tag)-[r:HAS_TRANSLATION]->(translation:translation) "
  //              + "WHERE LOWER(translation.name)=LOWER({uid}) "
  //              + "AND r.languageCode={languageCode} return tag, translation"
  // } else {
    var uid = req.params.uid; // match tag on id
    var cypher ="MATCH (set:synSet {uid:{uid}})<-[s:IN_SET]-(tag:tag)-[r:HAS_TRANSLATION]->(translation:translation) "
               +"WHERE r.languageCode={languageCode} return set as tag, translation, set.UID as setID "
               +"ORDER BY s.order"
  // }
  db.query(cypher, {uid: uid, languageCode: req.query.languageCode || 'en'},function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send() // TODO:tag not found...or not found in desired language? get translation and add to db...
    }
  })
}

function updateCore(req, res){
  // pass in tag ID ot be updated
  // pass in updated tag deets

  // copy tag to revision node BEFORE updating
  // track time of modification

  // NEED TO VALIDATE THIS
  // var cypher = "MATCH (member:member {uid: {memberID} }) "
  //            + "MATCH (tag:tag {uid: {tag}.uid }) "
  //            + "OPTIONAL MATCH (tag)-[r:HAS_REVISION]->(:edit) "
  //            + "DELETE r "
  //            + "CREATE (member)-[e:EDITED]->(revision:edit)<-[:HAS_REVISION]-(tag) " // create or merge here?
  //            + "SET revision = tag, e.date=TIMESTAMP() "
  //            + "MERGE (tag {tag}) "
  //            + "RETURN tag"
  // db.query(cypher, {tag: req.body.tag, memberID: res.locals.user.uid },function(err, result) {
  //   if (err) console.log(err);
  //   console.log(result)
  //   if(result){
  //     res.send(result[0])
  //   } else {
  //     res.send()
  //   }
  // })
}

/**
* creates a new synSet and primary tag with translation - (or updates existing - match based on provided string across all languages?)
* language code passed via member as "member.languageCode" on body, default to english
* @param {String} languageCode
* @param {String} tag
* @return {Object}
*/
function create(req, res){
  var newTagID = shortid.generate()
  var newSetID = shortid.generate()
  var newTransID = shortid.generate()

  req.body.tag.lower = req.body.translation.name.toLowerCase()
  var cypher = "MATCH (member:member {uid:{mid}}) "
              + "MERGE (set:synSet {lower: {set}.lower } ) "
                + "ON CREATE SET set={tag}, set.created=TIMESTAMP(), set.uid={setID} "
                + "ON MATCH SET set={tag}, set.updated=TIMESTAMP() "
             + "MERGE (tag:tag {lower: {tag}.lower } ) "
               + "ON CREATE SET tag={tag}, tag.created=TIMESTAMP(), tag.uid={tagID} "
               + "ON MATCH SET tag={tag}, tag.updated=TIMESTAMP() "
             + "CREATE (translation:translation {name: {translation}.name}) "
             + "MERGE (tag)-[in:IN_SET]->(set)<-[:ADDED {date:TIMESTAMP()} ]-(member)-[:ADDED {date:TIMESTAMP()} ]->(tag)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation)<-[:ADDED {date:TIMESTAMP()} ]-(member) "
             + "ON CREATE SET in.order = 1 "
             + "RETURN tag, translation, set.uid as setID"

  db.query(cypher, {
      set: req.body.tag,
      setID: newSetID,
      tag: req.body.tag,
      tagID: newTagID,
      translation: req.body.translation,
      transID: newTransID,
      mid: res.locals.user.uid
    },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function deleteCore(req, res){
  //TODO: check permissions
  //TODO: for production, re-lable rather than delete?
  var cypher = "MATCH (set:synSet {uid: {uid}}) "
              +"OPTIONAL MATCH (set)-[sr:IN_SET]-(tags:tag)-[r:HAS_TRANSLATION]-(ttr:translation) "
              +"OPTIONAL MATCH (set)-[pr:HAS_PROPERTY]-(props:prop)-[ppr:HAS_TRANSLATION]-(ptr:translation) "
              + "DETACH DELETE set,tags,props,ttr,ptr "
   db.query(cypher, {uid: req.params.setID },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}

/*
████████ ██████   █████  ███    ██ ███████ ██       █████  ████████ ██  ██████  ███    ██
   ██    ██   ██ ██   ██ ████   ██ ██      ██      ██   ██    ██    ██ ██    ██ ████   ██
   ██    ██████  ███████ ██ ██  ██ ███████ ██      ███████    ██    ██ ██    ██ ██ ██  ██
   ██    ██   ██ ██   ██ ██  ██ ██      ██ ██      ██   ██    ██    ██ ██    ██ ██  ██ ██
   ██    ██   ██ ██   ██ ██   ████ ███████ ███████ ██   ██    ██    ██  ██████  ██   ████
*/
function readTranslation(req, res){
  var cypher = "MATCH (n:synSet {uid: {uid}})-[sr:IN_SET]-(tag:tag)-[r:HAS_TRANSLATION]-(translation:translation) "
             + "WHERE sr.order=1 "
             + "RETURN tag, translation, n.uid as setID "
   db.query(cypher, {uid: req.params.setID },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}

function updateTranslation(req, res){
}

function createTranslation(req, res){
}

function deleteTranslation(req, res){
}

/*
███████ ██    ██ ███    ██  ██████  ███    ██ ██    ██ ███    ███
██       ██  ██  ████   ██ ██    ██ ████   ██  ██  ██  ████  ████
███████   ████   ██ ██  ██ ██    ██ ██ ██  ██   ████   ██ ████ ██
     ██    ██    ██  ██ ██ ██    ██ ██  ██ ██    ██    ██  ██  ██
███████    ██    ██   ████  ██████  ██   ████    ██    ██      ██
*/
function readSynonym(req, res){
  var cypher = "MATCH (set:synSet {uid: {set} })<-[r:IN_SET]-(syn:tag)-[lang:HAS_TRANSLATION]->(translation:translation) "
             + "WHERE "
                 + "lang.languageCode IN [ {language} , 'en' ] "
                  + "RETURN DISTINCT set.uid as setID, syn as tag, translation , r.order as order "
                  + "ORDER BY order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function updateSynonym(req, res){//TODO this is really a merge..need to have just add as well
  // TODO:check for member authorization...
  var cypher = "MATCH (main:synSet {uid: {setID}}), (sub:synSet {uid: {otherID}}) "
             + "SET sub:merged REMOVE sub:synSet "
             + "WITH  main, sub "
             + "MATCH (sub)<-[r:IN_SET]-(t:tag) " // copy in tags
             + "WITH main, sub, t, COLLECT(r) as rels "
             + "FOREACH (rel in rels | "
                   + "MERGE (main)<-[new:IN_SET]-(t) "
                   + " SET new = rel "
              + ") "
              + "WITH main, sub "
              + "MATCH (sub)<-[r:TAGGED_WITH]-(res:resource) "// copy in resources
              + "WITH main, sub, res, COLLECT(r) as rels "
              + "FOREACH (rel in rels | "
                    + "MERGE (main)<-[new:TAGGED_WITH]-(res) "
                    + " SET new = rel "
               + ") "
               + "WITH main, sub "
              //  + "MATCH (sub)-[r:IN_SET]-(g:synSet) "// copy in groups
              //  // does this work both ways?
              //  + "WITH main, sub, g, COLLECT(r) as rels "
              //  + "FOREACH (rel in rels | "
              //        + "MERGE (main)-[new:IN_GROUP]-(g) "
              //        + " SET new = rel "
              //   + ") "
                // copy meta too?
                // make MERGED_WITH rel between sets?
              + "return main "

// member: res.locals.user.uid // :ADDED
  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function deleteSynonym(req, res){
  // TODO:check for member authorization...

  // delete vs remove...
  // for remove- will need to create (or re-create) synset node?
  var cypher = "MATCH (syn:tag {uid:{tag}})-[r:IN_SET]->(set:synSet {uid:{set}}) "
             + "DELETE r "
             + "RETURN set, syn "

  db.query(cypher, {tag: req.params.tagID, set: req.params.setID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

/*
 ██████  ██████   ██████  ██    ██ ██████
██       ██   ██ ██    ██ ██    ██ ██   ██
██   ███ ██████  ██    ██ ██    ██ ██████
██    ██ ██   ██ ██    ██ ██    ██ ██
 ██████  ██   ██  ██████   ██████  ██
*/

function readGroup(req, res){
  var cypher = "MATCH (trans:translation)<-[tr:HAS_TRANSLATION]-(tag:tag)-[r:IN_SET]->(groups:group)<-[:IN_GROUP]-(set:synSet {uid: {set} }) "
          + "WHERE "
              + "r.order=1 and tr.languageCode IN [ {language} , 'en' ] "
               + "RETURN DISTINCT groups.uid as setID, trans as translation, tag"
              //  + "RETURN groups, translation,set.uid as setID"
  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function updateGroup(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{set}}), (g:synSet {uid:{group}}) "
             + "MERGE (base)-[r:IN_GROUP]->(g) "
             + "SET g:group, r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base.uid"

  db.query(cypher, {set: req.params.setID, group: req.params.groupID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function createGroup(req, res){
}

function deleteGroup(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (set:synSet {uid:{set}})-[r:IN_GROUP]->(group:group {uid:{group}}) "
             + "DELETE r "
             + "RETURN set, group"

  db.query(cypher, {set: req.params.setID, group: req.params.groupID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
/*
██     ██ ██ ████████ ██   ██ ██ ███    ██
██     ██ ██    ██    ██   ██ ██ ████   ██
██  █  ██ ██    ██    ███████ ██ ██ ██  ██
██ ███ ██ ██    ██    ██   ██ ██ ██  ██ ██
 ███ ███  ██    ██    ██   ██ ██ ██   ████
*/

function within(req, res){
  var cypher = "MATCH (set:synSet {uid: {set} })-[IN_SET]->(syn:synSet)<-[r:IN_SET]-(t:tag)-[lang:HAS_TRANSLATION]->(translation:translation) "
             + "WHERE lang.languageCode IN [ {language} , 'en' ] AND r.order=1  "
             + "RETURN DISTINCT syn.uid as setID, syn as tag, translation , r "
             + "ORDER BY  r.order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function updateWithin(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{baseID}}) , (other:synSet {uid:{otherID}}) "
             + "MERGE (base)-[r:IN_SET]->(other) "
             + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base, other"

  db.query(cypher, {baseID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
function deleteWithin(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{setID}})-[r:IN_SET]->(other:synSet {uid:{otherID}}) "
             + "DELETE r "
             + "RETURN base, other"

  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
/*
 ██████  ██████  ███    ██ ████████  █████  ██ ███    ██ ███████
██      ██    ██ ████   ██    ██    ██   ██ ██ ████   ██ ██
██      ██    ██ ██ ██  ██    ██    ███████ ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██    ██    ██   ██ ██ ██  ██ ██      ██
 ██████  ██████  ██   ████    ██    ██   ██ ██ ██   ████ ███████
*/


function contains(req, res){
  var cypher = "MATCH (set:synSet {uid: {set} })<-[sr:IN_SET]-(syn:synSet), "
                 + "(syn)<-[tr:IN_SET]-(t:tag)-[lang:HAS_TRANSLATION]->(translation:translation) "
                 + "WHERE tr.order=1 AND lang.languageCode IN [ {language} , 'en' ] "
                 + "RETURN DISTINCT syn as tag, syn.uid as setID, translation , tr, sr.order as order "
                 + "ORDER BY order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}
function updateContains(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{baseID}}) , (other:synSet {uid:{otherID}}) "
             + "MERGE (base)<-[r:IN_SET]-(other) "
             + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base as tag, base.uid as setID, other"

  db.query(cypher, {baseID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);

    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
function deleteContains(req, res){
  // TODO:check for member authorization..
  var cypher = "MATCH (base:synSet {uid:{setID}})<-[r:IN_SET]-(other:synSet {uid:{otherID}}) "
             + "DELETE r "
             + "RETURN base, other"

  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
// get tags contained by another, organized by the returned tags groups
function containsByGroup(req, res){
  // var cypher = "MATCH (set:synSet {uid: {set} })<-[sr:IN_SET]-(syn:synSet), "
  //                + "(syn)<-[tr:IN_SET]-(t:tag)-[lang:HAS_TRANSLATION]->(translation:translation) "
  //                + "OPTIONAL MATCH (syn:synSet)-[:IN_SET]->(group:synSet)"
  //                + "WHERE tr.order=1 AND lang.languageCode IN [ {language} , 'en' ] "
  //                + "RETURN DISTINCT syn as tag, syn.uid as setID, translation , tr, sr.order as order "
  //                + "ORDER BY order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}
/*
 █████  ██    ██ ████████  ██████   ██████  ██████  ███    ███ ██████  ██      ███████ ████████ ███████
██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ████  ████ ██   ██ ██      ██         ██    ██
███████ ██    ██    ██    ██    ██ ██      ██    ██ ██ ████ ██ ██████  ██      █████      ██    █████
██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ██  ██  ██ ██      ██      ██         ██    ██
██   ██  ██████     ██     ██████   ██████  ██████  ██      ██ ██      ███████ ███████    ██    ███████
*/


function search(req,res){

  var properties = {
    code: 'en',
    match: '(?i).*' + req.params.text + '.*',
    exclude: req.params.exclude || "",
  };

  var query = [
      "MATCH (set:synSet)<-[:IN_SET]-(core:tag)-[r:HAS_TRANSLATION {languageCode:{code}}]->(langNode) ",
      "WHERE langNode.name =~ {match} AND NOT set.uid IN [{exclude}] ",
      // "with langNode, collect(set) as tag "
      "RETURN DISTINCT set.uid AS setID, core.url AS url, set AS tag, langNode AS translation LIMIT 8" // order by....?
  ].join('\n');
  //TODO:order by...
  //TODO: only return top set if query matches mutiple tags in set
  db.query(query, properties, function (err, matches) {
      if (err) {console.log(err);}
      res.send(matches);
  });

}



// get most commonly tagged tags
// TODO: skip/limit - language - disregard/include synonyms? - Tags most tagged to other tags?
function most(req,res){
  var cypher = "MATCH (tag:tag)<-[:TAGGED_WITH]-(resource:resource) "
             + "RETURN tag.english, COUNT(resource) AS score "
             + "ORDER BY score DESC limit 10"
  db.query(cypher, {languageCode: req.query.languageCode || 'en'},function(err, result) {
    if (err) console.log(err);
      res.send(result) // resource not found
    })
  }


/*

88888b.  888d888 .d88b.  88888b.  .d8888b
888 "88b 888P"  d88""88b 888 "88b 88K
888  888 888    888  888 888  888 "Y8888b.
888 d88P 888    Y88..88P 888 d88P      X88
88888P"  888     "Y88P"  88888P"   88888P'
888                      888
888                      888
888                      888
*/

   function memberGetMeta(req,res){

      var cypher= "MATCH (s:synSet {uid: {setID} })-[mr:HAS_META {type:{rtype}}]-(re:resource) "
      + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
      + "WHERE p.order=1 AND plang.languageCode IN [ {languageCode} , 'en' ] "
      + "OPTIONAL MATCH (mem:member {uid:{mID}})-[mVote:CAST_VOTE]->(re) "
        + "WITH mVote, s, ptrans, mr, re, prop "
      + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(re) " // get global rankings
        + "WITH mVote, s, ptrans, mr, re, prop, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(gVote) AS votes "
      + "RETURN re AS resource, mr.order AS order, "
        + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
        + "{quality:mVote.quality,complexity:mVote.complexity} AS memberVote, "
        + "{quality: gq , complexity: gc } AS globalVote, "
        + "votes "
      + "ORDER BY order "
      db.query(cypher, {
        setID: req.params.setID,
        rtype:req.query.type,
        languageCode: req.query.languageCode || 'en',
        mID: res.locals.user.uid,
      },function(err, result) {
        if (err) console.log(err);
        // massage result for front end (collapse props onto core)...there's probably an alternative to iterating through all resources. Different schemea? Different query?
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
          delete result[rindex].order
        }

        res.send(result)
      })
    }

    function getMeta(req,res){

       var cypher= "MATCH (s:synSet {uid: {setID} })-[mr:HAS_META {type:{rtype}}]-(re:resource) "
       + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
       + "WHERE p.order=1 AND plang.languageCode IN [ {languageCode} , 'en' ] "
       + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(re) " // get global rankings
         + "WITH s, mr, ptrans, re, prop, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(gVote) AS votes "
       + "RETURN re AS resource, mr.order AS order, "
         + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
         + "{quality: gq , complexity: gc } AS globalVote, "
         + "votes "
       + "ORDER BY order "
       db.query(cypher, {setID: req.params.setID, rtype:req.query.type, languageCode: req.query.languageCode || 'en'},function(err, result) {
         if (err) console.log(err);
         // massage result for front end (collapse props onto core)...there's probably an alternative to iterating through all resources. Different schemea? Different query?
         for(rindex in result){
           for(pindex in result[rindex].properties){
             result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
           }
           delete result[rindex].properties // no need to send redundant data
           delete result[rindex].order
         }

         res.send(result)
       })
     }

  function tagMeta(req,res){

    var cypher = "MATCH (set:synSet {uid:{set}}) , (meta:resource {uid:{meta}}) "
               + "MERGE (set)-[r:HAS_META {type:{type}}]->(meta) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP(), r.order=0 "
               + "RETURN set, meta"

    db.query(cypher, {set: req.params.sID, type: req.body.type, meta: req.params.mID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function newTopIcon(req,res){
    var cypher = "MATCH (set:synSet {uid:{set}}) , (meta:resource {uid:{meta}}) "
               + "SET set.iconURL = meta.mThumb "
               + "RETURN set, meta"
    db.query(cypher, {set: req.params.sID, meta: req.params.rID},function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }


} // end module
