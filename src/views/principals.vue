<template >
	<div class="prince">

		<h2 class="thin center">
			knowlo principals
		</h2>
		<p class='center'>Note: this is <a target="_blank" href="https://docs.google.com/document/d/1k5Bb3jpCC47O39yQE2V6ufHCMIQbRfJuPRLbVDCPOTA/edit?usp=sharing">a living document</a> and is subject to change with community consensus.</p>
		<div class="row" style='float:right'>
		    <div class="col" style="max-width:700px;">

		      <div id="transparency" class="section scrollspy">
		        <h5>Default to Transparency </h5>
						<p>(Almost) everything is open. Aside from reasonable concerns over member's private information and other sensitive data (as deemed by the community), everything is available for all to see. This includes but is not limited to:</p>
						<p> - all <a target="_blank" href="https://docs.google.com/spreadsheets/d/1wqII5thbehl0WQNtKQrxbegW4s7i9pWrQWQ_WwGf3MM/edit?usp=sharing">financial information</a> (income & expenses: server costs, donations, bounty payments, etc.)</p>
						<p> - the <a target="_blank" href="http://github.com/bornytm/knowlo">knowlo codebase</a> </p>
						<p> - <router-link to="/status">real-time usage stats</router-link></p>
						<p> - development plans and roadmap</p>
						<p> - most everything else</p>
		      </div>

					<div id="community" class="section scrollspy">
		        <h5>Radically Community Driven</h5>
						<p>All decisions regarding future development are in the hands of the community and will be taken in the form of community-defined <a target="_blank" href="https://en.wikipedia.org/wiki/Weighted_voting">weighted voting</a>.</p>
						<p>Everything from what features should be developed (and how they're prioritized) to the logo, name, and even the mission is detagined by the community. </p>
						<p>Though knowlo has been seeded with some direction, it's better thought of as an app version of the game <a href='https://en.wikipedia.org/wiki/1000_Blank_White_Cards' target="_blank">1000 Blank White Cards.</a> </p>
		      </div>

					<div id="ReciprocalSharing" class="section scrollspy">
		        <h5>Reciprocal Sharing </h5>
						<p>Sharing of any personal details is completely optional. However, to see any information about other members, whether in cumulative community demographics or in discussion, you must first share that information about yourself.</p>
						<p>This includes things like stats on members activity on knowlo (date joined, resources viewed, time spent by tag, etc) as well as member's backgrounds, expertise, incomes, interests, approximate age, sex, and approximate location.</p>
						<p>Sharing is on a per category basis. For example, if you choose to share your interests, but not your sex, you will then be able to see the interests of other members, but will not be able to see any members sex.</p>
						<p>Of course, you can choose to share without reciprocation as well. For example, if you're sharing evidence of your expertise in an area, you can allow that information to be shared with people that have not provided evidence of their own expertise.</p>
		      </div>

					<div id="cost" class="section scrollspy">
		        <h5>No Cost Barriers - Proportional Subscription</h5>
						<p>Knowlo is currently a completely free platform with no immediate plans for that to change.</p>
						<p>That said, it does cost time and money to build, maintain, and host a project like this and ideally knowlo will be financially self sustaining.</p>
						<p>Within reasonable limitations (knowlo can't buy everyone a computer and internet access) finances will never be a barrier to someone's ability to take part in the community.</p>
						<p>For example, if knowlo were to become a subscription or donation based platform, membership or recommended donation amount would be a percentage of the users income (say, 1/500th or 1/1000th) rather than a fixed rate.</p>
		      </div>

					<div id='more' class='section scrollspy'>
						<h5>Your Principals Here</h5>
						<p>Being radically community driven means taking shape in any way the community sees fit- including adopting new practices, procedures, and principles that are deemed worthy.</p>
		    	</div>

				</div>
		    <div class="col hide-on-med-and-down m3 l2 table-of-contents-holder"style="width:250px;">
		      <ul class="section table-of-contents">
		        <li><a href="#transparency">Default to Transparency</a></li>
						<li><a href="#community">Community Driven</a></li>
						<li><a href="#ReciprocalSharing">Reciprocal Sharing</a></li>
						<li><a href="#cost">No Cost Barrier</a></li>
						<li><a href="#more">Your Principal Here</a></li>
		      </ul>
		    </div>
		  </div>
	</div>
</template>
<script>
import $ from 'jquery'
export default {
  name: 'principals',
  mounted () {
    $('.scrollspy').scrollSpy()
  }
}
</script>

<style>
.prince {
  margin-left: 20px;
  margin-right: 20px;
  display: flow-root;
}
.prince h5 {
  font-weight:300;
}
.prince p {
  font-weight:300;
}
.table-of-contents-holder {
  position: sticky;
  top: 100px;
}
</style>
