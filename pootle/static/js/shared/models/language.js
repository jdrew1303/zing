/*
 * Copyright (C) Pootle contributors.
 * Copyright (C) Zing contributors.
 *
 * This file is a part of the Zing project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import Backbone from 'backbone';
import _ from 'underscore';

import AdminAPIMixin from 'mixins/admin_api';


export const Language = Backbone.Model.extend({

  defaults: {
    code: '',
    fullname: '',
    specialchars: '',
    nplurals: '0',
    pluralequation: '',
  },

  fieldChoices: {
    nplurals: [
      // FIXME: using `gettext()` here breaks everything
      [0, 'Unknown'], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6],
    ],
  },

  urlRoot() {
    return '/xhr/admin/languages/';
  },

  getAbsoluteUrl() {
    return `/${this.get('code')}/`;
  },

  getPermissionsUrl() {
    return `/${this.get('code')}/admin/permissions/`;
  },

  getFieldChoices(fieldName) {
    if (this.fieldChoices && this.fieldChoices.hasOwnProperty(fieldName)) {
      return this.fieldChoices[fieldName].map((field) => ({
        // FIXME: react-select's issue #25 prevents using non-string values
        value: field[0].toString(),
        label: field[1],
      }));
    }
    return [];
  },

});


export const LanguageSet = Backbone.Collection.extend(
  _.extend({}, AdminAPIMixin, {

    model: Language,

    url: '/xhr/admin/languages/',

  })
);
