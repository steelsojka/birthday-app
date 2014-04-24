// Closure to prevent global variables
(function(Backbone, _) {

	/**
	 * @method
	 * @name getMonth
	 * @return {String} The current month
	 */
	/**
	 * @method
	 * @name setMonth
	 * @param {String} month The month to set
	 */
	var BirthdayMonth = (function() {
		var currentMonth = null; 

		return {
			getMonth: function() {
				return currentMonth;
			},
			setMonth: function(month) {
				currentMonth = month;
				console.log("BirthdayMonth API: User set \"" + currentMonth + "\" as the new birthday month");
			}
		};
	}());

	// Month model
	var Month = Backbone.Model.extend({
		defaults: {
			name: "",
			number: 0
		}
	});

	// Year collection
	var Year = Backbone.Collection.extend({
		model: Month,
		comparator: "number" // Sort by number by default
	});

	// This view is responsible for each month in our collection
	var MonthView = Backbone.View.extend({
		className: "month-container",
		template: _.template($("#month-template").html()),
		initialize: function() {
			this.listenTo(this.model, "change", this.render);
			this.listenTo(this.model, "destroy", this.remove);
			this.render();
		},
		events: {
			"click": "select"
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		select: function() {
			BirthdayMonth.setMonth(this.model.get("name"));

			// Trigger the change to any views attached
			this.model.collection.trigger("birthdaySet");
		}
	});

	var YearView = Backbone.View.extend({
		el: $("#app-container"),
		className: "year-container",
		template: _.template($("#year-template").html()),
		childViews: [],
		events: {
			"click .sort-alpha": "sortAlpha",
			"click .sort-numeric": "sortNumeric"
		},
		initialize: function() {
			this.listenTo(this.collection, "sort", this.render);
			this.listenTo(this.collection, "birthdaySet", this.render);

			this.$el.html(this.template());

			// This is the container that holds our month views.
			// Storing it on the view so we don't have to query the DOM again.
			this.$list = this.$("#months-container");

			this.render();
		},
		render: function() {
			var selectedMonth = BirthdayMonth.getMonth();

			// Remove any existing views to perform clean up work
			_.invoke(this.childViews, "remove");

			// This will store our new set of child views
			this.childViews = this.collection.map(function(model) {
				var monthView = new MonthView({
					model: model
				});

				// If this is the selected month add a class to it
				if (selectedMonth === model.get("name")) {
					monthView.$el.addClass("selected");
				}

				// Append the views to the DOM
				this.$list.append(monthView.el);
				
				return monthView;
			}.bind(this));
		},
		sortAlpha: function() {
			this.collection.comparator = "name";
			this.collection.sort();
		},
		sortNumeric: function() {
			this.collection.comparator = "number";
			this.collection.sort();
		}
	});

	var yearCollection = new Year([
		{name: "January", number: 0},
		{name: "February", number: 1},
		{name: "March", number: 2},
		{name: "April", number: 3},
		{name: "May", number: 4},
		{name: "June", number: 5},
		{name: "July", number: 6},
		{name: "August", number: 7},
		{name: "September", number: 8},
		{name: "October", number: 9},
		{name: "November", number: 10},
		{name: "December", number: 11},
	]);

	BirthdayMonth.setMonth("October"); // Default month

	// Create the year view
	new YearView({
		collection: yearCollection
	});

}(Backbone, _));
