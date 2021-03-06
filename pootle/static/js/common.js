/*
 * Copyright (C) Pootle contributors.
 * Copyright (C) Zing contributors.
 *
 * This file is a part of the Zing project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import 'backbone-safesync';
import $ from 'jquery';
import 'jquery-magnific-popup';
import 'jquery-select2';
import 'jquery-tipsy';
import Spinner from 'spin';

import { q } from 'utils/dom';

import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'components/Avatar';
import { showAboutDialog } from './shared/components/AboutDialog';
import { showKeyboardHelpDialog } from './shared/components/KeyboardHelpDialog';
import RandomSymbolsBackground from './welcome/components/RandomSymbolsBackground';
import RandomMessage from './welcome/components/RandomMessage';
import { greetings } from './welcome/greetings';

import cookie from 'utils/cookie';
import diff from 'utils/diff';
import mousetrap from 'mousetrap';

import agreement from './agreement';
import auth from './auth';
import browser from './browser';
import captcha from './captcha';
import contact from './contact';
import dropdown from './dropdown';
import helpers from './helpers';
import score from './score';
import search from './search';
import stats from './stats';
import configureStore from './store';
import utils from './utils';


Spinner.defaults = {
  lines: 11,
  length: 2,
  width: 5,
  radius: 11,
  rotate: 0,
  corners: 1,
  color: '#000',
  direction: 1,
  speed: 1,
  trail: 50,
  opacity: 1 / 4,
  fps: 20,
  zIndex: 2e9,
  className: 'spinner',
  top: 'auto',
  left: 'auto',
  position: 'relative',
};


// Pootle-specifics. These need to be kept here until:
// 1. they evolve into apps of their own
// 2. they're only used directly as modules from other apps (and they are
//    not referenced like `PTL.<module>.<method>`)

window.PTL = window.PTL || {};

PTL.auth = auth;
PTL.agreement = agreement;
PTL.browser = browser;
PTL.captcha = captcha;
PTL.cookie = cookie;
PTL.contact = contact;
PTL.dropdown = dropdown;
PTL.score = score;
PTL.search = search;
PTL.stats = stats;
PTL.utils = utils;
PTL.utils.diff = diff;


PTL.store = configureStore();


PTL.common = {

  init(opts) {
    PTL.auth.init();
    PTL.browser.init();

    $(window).load(() => {
      $('body').removeClass('preload');
    });

    if (opts.hasSidebar) {
      helpers.fixSidebarHeight();
      $(window).on('resize', helpers.fixSidebarHeight);
    }

    // Tipsy setup
    $(document).tipsy({
      gravity: $.fn.tipsy.autoBounds2(150, 'n'),
      html: true,
      fade: true,
      delayIn: 750,
      opacity: 1,
      live: '[title], [original-title]',
    });
    setInterval($.fn.tipsy.revalidate, 1000);

    $('.js-select2').select2({
      width: 'resolve',
    });

    // Set CSRF token for XHR requests (jQuery-specific)
    $.ajaxSetup({
      traditional: true,
      crossDomain: false,
      beforeSend(xhr, settings) {
        // Set CSRF token only for local requests.
        if (!this.crossDomain &&
            !/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type)) {
          xhr.setRequestHeader('X-CSRFToken', cookie('csrftoken'));
        }
      },
    });

    /* Page sidebar */
    // TODO: create a named function
    $(document).on('click', '.js-sidebar-toggle', () => {
      const $sidebar = $('.js-sidebar');
      const openClass = 'sidebar-open';
      const cookieName = 'pootle-browser-sidebar';
      const cookieData = JSON.parse(cookie(cookieName)) || {};

      $sidebar.toggleClass(openClass);

      cookieData.isOpen = $sidebar.hasClass(openClass);
      cookie(cookieName, JSON.stringify(cookieData), { path: '/' });
    });

    /* Popups */
    $(document).magnificPopup({
      type: 'ajax',
      delegate: '.js-popup-ajax',
      mainClass: 'popup-ajax',
    });

    $(document).on('click', '.js-about-link', (e) => {
      e.preventDefault();
      showAboutDialog();
    });

    /* Generic toggle */
    $(document).on('click', '.js-toggle', function toggle(e) {
      e.preventDefault();
      const target = $(this).attr('href') || $(this).data('target');
      $(target).toggle();
    });

    /* Sorts language names within select elements */
    const ids = ['id_languages', 'id_alt_src_langs',
                 '-source_language'];

    $.each(ids, (i, id) => {
      const $selects = $(`select[id$="${id}"]`);

      $.each($selects, (j, select) => {
        const $select = $(select);
        const options = $('option', $select);
        let selected;

        if (options.length) {
          if (!$select.is('[multiple]')) {
            selected = $(':selected', $select);
          }

          const opsArray = $.makeArray(options);
          opsArray.sort((a, b) => utils.strCmp($(a).text(), $(b).text()));

          options.remove();
          $select.append($(opsArray));

          if (!$select.is('[multiple]')) {
            $select.get(0).selectedIndex = $(opsArray).index(selected);
          }
        }
      });
    });


    /* Bind hotkeys */
    const hotkeys = mousetrap(document.body);

    hotkeys.stopCallback = (e, element, combo) => {
      if (combo !== '?') {
        return false;
      }

      // stop for input, select and textarea
      return element.tagName === 'INPUT'
        || element.tagName === 'SELECT'
        || element.tagName === 'TEXTAREA';
    };


    hotkeys.bind(['f1', '?'], (e) => {
      e.preventDefault();
      showKeyboardHelpDialog();
    });


    /* Setup React components */

    if (q('#js-navbar-avatar') !== null) {
      ReactDOM.render(
        <Avatar
          size={24}
          tagName="span"
          {...opts.user}
        />,
        q('#js-navbar-avatar')
      );
    }

    if (q('#js-dynamic-background') !== null) {
      ReactDOM.render(
        <RandomSymbolsBackground />,
        q('#js-dynamic-background')
      );
    }

    if (q('#js-dynamic-greeting') !== null) {
      ReactDOM.render(
        <RandomMessage
          items={greetings}
        />,
        q('#js-dynamic-greeting')
      );
    }
  },

};
