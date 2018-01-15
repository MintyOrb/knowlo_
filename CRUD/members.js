module.exports = function(app, db){

  // member routes
  app.get('/api/member/:muid', publicRead);       // read details of a single member page
  app.get('/api/member/:muid/history', readHistory);       // read member viweded history
  app.get('/api/member/:muid/set/top', readTopSets);       // read member sets in group
  app.get('/api/member/:muid/set/:guid', readGroups);       // read member sets in group
  app.get('/api/auth/member/:muid', memberReadFull);   // read details of a single member page
  app.put('/api/auth/member/:muid', updateCore); // update a single members core node data
  app.post('/api/auth/member', createCore);    // create (or update, if present) a member core node.
  app.delete('/api/auth/member', deleteCore);  // delete member core node and relationships....and translations?

  // app.get('/member/:rid/tag/', readTags);          // retrieve a members tagged tags
  // app.put('/member/:rid/tag/', updateTags);        // batch add tags to member (with ids) - adds provided tags, doesn't remove relationships
  // app.post('/member/:rid/tag/', batchSetTags);     // batch set tags to member (with ids) - delete all tags relationships and create for  tags provided
  // app.put('/member/:rid/tag/:id', setTag);         // add a single tag to a members by id
  // app.delete('/member/:rid/tag/:id', deleteTag);   // remove a single tag relationship from a members | DELETE /tag/:id to delete tag node itself

  function publicRead(req, res){
    console.log(req.params)
    // resource viweded
    // date joined (member since)
    // number of votes? average complexity/quality rating...
    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "OPTIONAL MATCH (mem)-[v:VIEWED]->(re:resource) "//"-[:TAGGED_WITH]-(sets:synSets) "
               + "WITH count(v) as totalViewed, mem "
               + "OPTIONAL MATCH (mem)-[gVote:CAST_VOTE]->(:resource) " // get global rankings
                 + "WITH mem, totalViewed, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(distinct gVote) AS totalVotes "
               + "RETURN  "
               + "{quality: gq , complexity: gc } AS globalVote, "
               + "totalVotes, "
               + "totalViewed, "
               + "mem.name as name, "
               + "mem.joined as joined "


    db.query(cypher, { muid: req.params.muid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function readHistory(req, res){
    // history of first when viewed resources
    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "OPTIONAL MATCH (mem)-[v:VIEWED]->(re:resource) "//"-[:TAGGED_WITH]-(sets:synSets) "
               + "WITH re,v "
               + "OPTIONAL MATCH (mem)-[gVote:CAST_VOTE]->(re) " // get global rankings
                 + "WITH re, v, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(distinct gVote) AS votes "
               + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
               + "WHERE p.order=1 AND plang.languageCode IN [ {language} , 'en' ] "
               + "RETURN  "
               + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
               + "{quality: gq , complexity: gc } AS globalVote, "
               + "votes, "
               + "v, re as resource "
               + "ORDER BY v.lastViewed desc "
               + "LIMIT 10 "

    db.query(cypher, { muid: req.params.muid, groupUID: req.params.guid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      if(result){
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
        }
        res.send(result)
      } else {
        res.send()
      }
    })
  }
  function readTopSets(req, res){
    if(req.query.limit > 50){
      req.query.limit = 50
    }
    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "MATCH (mem)-[v:VIEWED]->(re:resource)-[:TAGGED_WITH]->(sets:synSet) "
               + "WITH sets, count(*) as count "
               + "OPTIONAL MATCH (sets)-[setR:IN_SET]-(:tag)-[:HAS_TRANSLATION {languageCode: {language} }]->(translation:translation) "
               + "WHERE setR.order=1 "
               + "RETURN translation, sets as tag, sets.uid AS setID, "
               + " count  "

               // + " SKIP {skip}  "
               cypher += "ORDER BY  count desc LIMIT {limit} "

    db.query(cypher, { muid: req.params.muid, language: 'en', limit: parseInt(req.query.limit), skip: parseInt(req.query.skip) },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result)
      } else {
        res.send()
      }
    })
  }

  function readGroups(req, res){

    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "MATCH (mem)-[v:VIEWED]->(re:resource)-[:TAGGED_WITH]->(sets:synSet)-[gOrder:IN_SET]->(group:synSet) "
               + "WHERE group.uid = {groupUID} "
               + "WITH sets, gOrder, count(*) as count "
               + "OPTIONAL MATCH (sets)-[setR:IN_SET]-(:tag)-[:HAS_TRANSLATION {languageCode: {language} }]->(translation:translation) "
               + "WHERE setR.order=1 "
               + "RETURN translation, sets as tag, sets.uid AS setID, "
               + "gOrder.order as order, count  "
               + "ORDER BY  order "

    db.query(cypher, { muid: req.params.muid, groupUID: req.params.guid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result)
      } else {
        res.send()
      }
    })
  }

  function memberReadFull(req, res){
  }

  function updateCore(req, res){
  }

  function createCore(req, res){
    var member = {
      name: res.locals.user.name,
      email: res.locals.user.email,
      picture: res.locals.user.picture,
      uid: res.locals.user.uid
    }

    var cypher = "MERGE (member:member {uid:{map}.uid}) "
               + "ON CREATE SET {map}.joined=TIMESTAMP(), {map}.lastLogin=TIMESTAMP(), member={map} "
               + "ON MATCH SET member={map}, member.lastLogin=TIMESTAMP() "
               + "RETURN member"

    db.query(cypher, {map: member },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function deleteCore(req, res){
  }
}
