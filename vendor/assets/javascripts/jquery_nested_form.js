jQuery(function($) {
  window.NestedFormEvents = function() {
    this.addFields = $.proxy(this.addFields, this);
    this.removeFields = $.proxy(this.removeFields, this);
  };

  NestedFormEvents.prototype = {
    addFields: function(e) {
      // Setup
      var link    = e.currentTarget;
      var assoc   = $(link).attr('data-association');            // Name of child
      var content = $('#' + assoc + '_fields_blueprint').html(); // Fields template

      // Make the context correct by replacing new_<parents> with the generated ID
      // of each of the parent objects
      var context = ($(link).closest('.fields').find('input:first').attr('name') || '').replace(new RegExp('\[[a-z]+\]$'), '');

      // context will be something like this for a brand new form:
      // project[tasks_attributes][new_1255929127459][assignments_attributes][new_1255929128105]
      // or for an edit form:
      // project[tasks_attributes][0][assignments_attributes][1]
      if (context) {
        // Select paramNames and paramIds
        var parts = context.match(/([a-z_]+_attributes|(new_)?[0-9]+)/g) || [];
        // Create empty list for parts of name
        var parts_list = new Array();

        // Determine(? bad english, sorry) a type of name's part, and add to list
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].match(/[a-z_]+_attributes/g)) {
            parts_list.push({
              name: true,
              value: parts[i]
            });
          } else {
            parts_list.push({
              name: false,
              value: parts[i]
            });
          }
        }

        // Replace paramName and paramId, only if paramName exists, and next element
        // is paramId
        for (var i = 0; i < parts_list.length - 1; i++) {
          if (parts_list[i].name && parts_list[i + 1]) {
            content = content.replace(
              new RegExp('(_' + parts_list[i].value + ')_.+?_', 'g'),
              '$1_' + parts_list[i + 1].value + '_');

            content = content.replace(
              new RegExp('(\\[' + parts_list[i].value + '\\])\\[.+?\\]', 'g'),
              '$1[' + parts_list[i + 1].value + ']');
          }
        }

      }

      // Make a unique ID for the new child
      var regexp  = new RegExp('new_' + assoc, 'g');
      var new_id  = new Date().getTime();
      content     = content.replace(regexp, "new_" + new_id);

      var field = this.insertFields(content, assoc, link);

      $(link).closest("form")
        .trigger({ type: 'nested:fieldAdded', field: field })
        .trigger({ type: 'nested:fieldAdded:' + assoc, field: field });
      return false;
    },
    insertFields: function(content, assoc, link) {
      return $(content).insertBefore(link);
    },
    removeFields: function(e) {
      var link = e.currentTarget;
      var hiddenField = $(link).prev('input[type=hidden]');
      hiddenField.val('1');
      // if (hiddenField) {
      //   $(link).v
      //   hiddenField.value = '1';
      // }
      var field = $(link).closest('.fields');
      field.hide();
      $(link).closest("form").trigger({ type: 'nested:fieldRemoved', field: field });
      return false;
    }
  };

  window.nestedFormEvents = new NestedFormEvents();
  $('form a.add_nested_fields').live('click', nestedFormEvents.addFields);
  $('form a.remove_nested_fields').live('click', nestedFormEvents.removeFields);
});
