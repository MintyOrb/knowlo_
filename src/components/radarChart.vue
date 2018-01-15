<script>
import VueChartJs from 'vue-chartjs'
export default {
  name: 'radar',
  extends: VueChartJs.Radar,
  props: ['data', 'dataLabel', 'labels'],
  methods: {
    render: function () {
      this.renderChart({
        labels: this.labels,
        datasets: [
          {
            // label: this.dataLabel,
            backgroundColor: '#2196F3',
            data: this.data,
            pointBorderColor: '#000000',
            pointBackgroundColor: '#ffffff'
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scale: {
          pointLabels: {
            fontSize: 15
          }
        }
      })
    }
  },
  mounted () {
    this.render()
  },
  watch: {
    data: function () {
      this.render()
    }
  }
}
</script>
