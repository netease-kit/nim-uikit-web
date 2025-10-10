Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    subTitle: {
      type: String,
      value: ''
    },
    backgroundColor: {
      type: String,
      value: '#ffffff'
    },
    showLeft: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onBack() {
      this.triggerEvent('back')
    }
  }
})