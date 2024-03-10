// <nowiki>


(function($) {


	/*
	 ****************************************
	 *** twinklefluff.js: module hồi sửa/lùi sửa
	 *** rollback: lùi sửa ([[Wikipedia:Lùi sửa]]), revert: hồi sửa [[Wikipedia:Hồi sửa]]
	 ****************************************
	 * Mode of invocation:     Links on contributions, recent changes, history, and diff pages
	 * Active on:              Khác biệt giữa các phiên bản, lịch sử trang, Đặc biệt:Thay đổi gần đây(đã liên kết),
							   và Đặc biệt:Đóng góp
	 */
	
	/**
	 Twinklefluff revert and antivandalism utility
	 */
	
	Twinkle.fluff = function twinklefluff() {
		if (mw.config.get('wgIsProbablyEditable')) {
			// Only proceed if the user can actually edit the page
			// in question (ignored for contributions, see #632).
			// wgIsProbablyEditable should take care of
			// namespace/contentModel restrictions as well as
			// explicit protections; it won't take care of
			// cascading or TitleBlacklist restrictions
			if (mw.config.get('wgDiffNewId') || mw.config.get('wgDiffOldId')) { // wgDiffOldId included for clarity in if else loop [[phab:T214985]]
				mw.hook('wikipage.diff').add(function () { // Reload alongside the revision slider
					Twinkle.fluff.addLinks.diff();
				});
			} else if (mw.config.get('wgAction') === 'view' && mw.config.get('wgCurRevisionId') !== mw.config.get('wgRevisionId')) {
				Twinkle.fluff.addLinks.oldid();
			} else if (mw.config.get('wgAction') === 'history' && mw.config.get('wgArticleId')) {
				Twinkle.fluff.addLinks.history();
			}
		} else if (mw.config.get('wgNamespaceNumber') === -1) {
			Twinkle.fluff.skipTalk = !Twinkle.getPref('openTalkPageOnAutoRevert');
			Twinkle.fluff.rollbackInPlace = Twinkle.getPref('rollbackInPlace');
	
			if (mw.config.get('wgCanonicalSpecialPageName') === 'Contributions') {
				Twinkle.fluff.addLinks.contributions();
			} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Recentchanges' || mw.config.get('wgCanonicalSpecialPageName') === 'Recentchangeslinked') {
				// Reload with recent changes updates
				// structuredChangeFilters.ui.initialized is just on load
				mw.hook('wikipage.content').add(function(item) {
					if (item.is('div')) {
						Twinkle.fluff.addLinks.recentchanges();
					}
				});
			}
		}
	};
	
	// A list of usernames, usually only bots, that vandalism revert is jumped
	// over; that is, if vandalism revert was chosen on such username, then its
	// target is on the revision before.  This is for handling quick bots that
	// makes edits seconds after the original edit is made.  This only affects
	// vandalism rollback; for good faith rollback, it will stop, indicating a bot
	// has no faith, and for normal rollback, it will rollback that edit.
	Twinkle.fluff.trustedBots = ['AnomieBOT', 'SineBot'];
	Twinkle.fluff.skipTalk = null;
	Twinkle.fluff.rollbackInPlace = null;
	// String to insert when a username is hidden
	Twinkle.fluff.hiddenName = 'an unknown user';
	
	// Consolidated construction of fluff links
	Twinkle.fluff.linkBuilder = {
		spanTag: function(color, content) {
			var span = document.createElement('span');
			span.style.color = color;
			span.appendChild(document.createTextNode(content));
			return span;
		},
	
		buildLink: function(color, text) {
			var link = document.createElement('a');
			link.appendChild(Twinkle.fluff.linkBuilder.spanTag('Black', '['));
			link.appendChild(Twinkle.fluff.linkBuilder.spanTag(color, text));
			link.appendChild(Twinkle.fluff.linkBuilder.spanTag('Black', ']'));
			link.href = '#';
			return link;
		},
	
		/**
		 * @param {string} [vandal=null] - Username of the editor being reverted
		 * Provide a falsey value if the username is hidden, defaults to null
		 * @param {boolean} inline - True to create two links in a span, false
		 * to create three links in a div (optional)
		 * @param {number|string} [rev=wgCurRevisionId] - Revision ID being reverted (optional)
		 * @param {string} [page=wgPageName] - Page being reverted (optional)
		 */
		rollbackLinks: function(vandal, inline, rev, page) {
			vandal = vandal || null;
	
			var elem = inline ? 'span' : 'div';
			var revNode = document.createElement(elem);
	
			rev = parseInt(rev, 10);
			if (rev) {
				revNode.setAttribute('id', 'tw-revert' + rev);
			} else {
				revNode.setAttribute('id', 'tw-revert');
			}
	
			var normNode = document.createElement('strong');
			var vandNode = document.createElement('strong');
	
			var normLink = Twinkle.fluff.linkBuilder.buildLink('SteelBlue', 'lùi sửa');
			var vandLink = Twinkle.fluff.linkBuilder.buildLink('Red', 'lùi sửa phá hoại');
	
			$(normLink).click(function() {
				Twinkle.fluff.revert('norm', vandal, rev, page);
				Twinkle.fluff.disableLinks(revNode);
			});
			$(vandLink).click(function() {
				Twinkle.fluff.revert('vand', vandal, rev, page);
				Twinkle.fluff.disableLinks(revNode);
			});
	
			vandNode.appendChild(vandLink);
			normNode.appendChild(normLink);
	
			var separator = inline ? ' ' : ' || ';
	
			if (!inline) {
				var agfNode = document.createElement('strong');
				var agfLink = Twinkle.fluff.linkBuilder.buildLink('DarkOliveGreen', 'lùi sửa (thiện chí)');
				$(agfLink).click(function() {
					Twinkle.fluff.revert('agf', vandal, rev, page);
					// Twinkle.fluff.disableLinks(revNode); // rollbackInPlace not relevant for any inline situations
				});
				agfNode.appendChild(agfLink);
				revNode.appendChild(agfNode);
			}
			revNode.appendChild(document.createTextNode(separator));
			revNode.appendChild(normNode);
			revNode.appendChild(document.createTextNode(separator));
			revNode.appendChild(vandNode);
	
			return revNode;
	
		},
	
		// Build [restore this revision] links
		restoreThisRevisionLink: function(revisionRef, inline) {
			// If not a specific revision number, should be wgDiffNewId/wgDiffOldId/wgRevisionId
			revisionRef = typeof revisionRef === 'number' ? revisionRef : mw.config.get(revisionRef);
	
			var elem = inline ? 'span' : 'div';
			var revertToRevisionNode = document.createElement(elem);
	
			revertToRevisionNode.setAttribute('id', 'tw-revert-to-' + revisionRef);
			revertToRevisionNode.style.fontWeight = 'bold';
	
			var revertToRevisionLink = Twinkle.fluff.linkBuilder.buildLink('SaddleBrown', 'phục hồi phiên bản này');
			$(revertToRevisionLink).click(function() {
				Twinkle.fluff.revertToRevision(revisionRef);
			});
	
			if (inline) {
				revertToRevisionNode.appendChild(document.createTextNode(' '));
			}
			revertToRevisionNode.appendChild(revertToRevisionLink);
			return revertToRevisionNode;
		}
	};
	
	
	Twinkle.fluff.addLinks = {
		contributions: function() {
			// $('sp-contributions-footer-anon-range') relies on the fmbox
			// id in [[MediaWiki:Sp-contributions-footer-anon-range]] and
			// is used to show rollback/vandalism links for IP ranges
			var isRange = !!$('#sp-contributions-footer-anon-range')[0];
			if (mw.config.exists('wgRelevantUserName') || isRange) {
				// Get the username these contributions are for
				var username = mw.config.get('wgRelevantUserName');
				if (Twinkle.getPref('showRollbackLinks').indexOf('contribs') !== -1 ||
					(mw.config.get('wgUserName') !== username && Twinkle.getPref('showRollbackLinks').indexOf('others') !== -1) ||
					(mw.config.get('wgUserName') === username && Twinkle.getPref('showRollbackLinks').indexOf('mine') !== -1)) {
					var $list = $('#mw-content-text').find('ul li:has(span.mw-uctop):has(.mw-changeslist-diff)');
	
					$list.each(function(key, current) {
						// revid is also available in the href of both
						// .mw-changeslist-date or .mw-changeslist-diff
						var page = $(current).find('.mw-contributions-title').text();
	
						// Get username for IP ranges (wgRelevantUserName is null)
						if (isRange) {
							// The :not is possibly unnecessary, as it appears that
							// .mw-userlink is simply not present if the username is hidden
							username = $(current).find('.mw-userlink:not(.history-deleted)').text();
						}
	
						// It's unlikely, but we can't easily check for revdel'd usernames
						// since only a strong element is provided, with no easy selector [[phab:T255903]]
						current.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(username, true, current.dataset.mwRevid, page));
					});
				}
			}
		},
	
		recentchanges: function() {
			if (Twinkle.getPref('showRollbackLinks').indexOf('recent') !== -1) {
				// Latest and revertable (not page creations, logs, categorizations, etc.)
				var $list = $('.mw-changeslist .mw-changeslist-last.mw-changeslist-src-mw-edit');
				// Exclude top-level header if "group changes" preference is used
				// and find only individual lines or nested lines
				$list = $list.not('.mw-rcfilters-ui-highlights-enhanced-toplevel').find('.mw-changeslist-line-inner, td.mw-enhanced-rc-nested');
	
				$list.each(function(key, current) {
					// The :not is possibly unnecessary, as it appears that
					// .mw-userlink is simply not present if the username is hidden
					var vandal = $(current).find('.mw-userlink:not(.history-deleted)').text();
					var href = $(current).find('.mw-changeslist-diff').attr('href');
					var rev = mw.util.getParamValue('diff', href);
					var page = current.dataset.targetPage;
					current.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(vandal, true, rev, page));
				});
			}
		},
	
		history: function() {
			if (Twinkle.getPref('showRollbackLinks').indexOf('history') !== -1) {
				// All revs
				var histList = $('#pagehistory li').toArray();
	
				// On first page of results, so add revert/rollback
				// links to the top revision
				if (!$('.mw-firstlink').length) {
					var first = histList.shift();
					var vandal = $(first).find('.mw-userlink:not(.history-deleted)').text();
	
					// Check for first username different than the top user,
					// only apply rollback links if/when found
					// for faster than every
					for (var i = 0; i < histList.length; i++) {
						if ($(histList[i]).find('.mw-userlink').text() !== vandal) {
							first.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(vandal, true));
							break;
						}
					}
				}
	
				// oldid
				histList.forEach(function(rev) {
					// From restoreThisRevision, non-transferable
					// If the text has been revdel'd, it gets wrapped in a span with .history-deleted,
					// and href will be undefined (and thus oldid is NaN)
					var href = rev.querySelector('.mw-changeslist-date').href;
					var oldid = parseInt(mw.util.getParamValue('oldid', href), 10);
					if (!isNaN(oldid)) {
						rev.appendChild(Twinkle.fluff.linkBuilder.restoreThisRevisionLink(oldid, true));
					}
				});
	
	
			}
		},
	
		diff: function() {
			// Autofill user talk links on diffs with vanarticle for easy warning, but don't autowarn
			var warnFromTalk = function(xtitle) {
				var talkLink = $('#mw-diff-' + xtitle + '2 .mw-usertoollinks a').first();
				if (talkLink.length) {
					var extraParams = 'vanarticle=' + mw.util.rawurlencode(Morebits.pageNameNorm) + '&' + 'noautowarn=true';
					// diffIDs for vanarticlerevid
					extraParams += '&vanarticlerevid=';
					extraParams += xtitle === 'otitle' ? mw.config.get('wgDiffOldId') : mw.config.get('wgDiffNewId');
	
					var href = talkLink.attr('href');
					if (href.indexOf('?') === -1) {
						talkLink.attr('href', href + '?' + extraParams);
					} else {
						talkLink.attr('href', href + '&' + extraParams);
					}
				}
			};
	
			// Older revision
			warnFromTalk('otitle'); // Add quick-warn link to user talk link
			// Don't load if there's a single revision or weird diff (cur on latest)
			if (mw.config.get('wgDiffOldId') && (mw.config.get('wgDiffOldId') !== mw.config.get('wgDiffNewId'))) {
				// Add a [restore this revision] link to the older revision
				var oldTitle = document.getElementById('mw-diff-otitle1').parentNode;
				oldTitle.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgDiffOldId'), oldTitle.firstChild);
			}
	
			// Newer revision
			warnFromTalk('ntitle'); // Add quick-warn link to user talk link
			// Add either restore or rollback links to the newer revision
			// Don't show if there's a single revision or weird diff (prev on first)
			if (document.getElementById('differences-nextlink')) {
				// Not latest revision, add [restore this revision] link to newer revision
				var newTitle = document.getElementById('mw-diff-ntitle1').parentNode;
				newTitle.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgDiffNewId'), newTitle.firstChild);
			} else if (Twinkle.getPref('showRollbackLinks').indexOf('diff') !== -1 && mw.config.get('wgDiffOldId') && (mw.config.get('wgDiffOldId') !== mw.config.get('wgDiffNewId') || document.getElementById('differences-prevlink'))) {
				// Normally .mw-userlink is a link, but if the
				// username is hidden, it will be a span with
				// .history-deleted as well. When a sysop views the
				// hidden content, the span contains the username in a
				// link element, which will *just* have
				// .mw-userlink. The below thus finds the first
				// instance of the class, which if hidden is the span
				// and thus text returns undefined. Technically, this
				// is a place where sysops *could* have more
				// information available to them (as above, via
				// &unhide=1), since the username will be available by
				// checking a.mw-userlink instead, but revert() will
				// need reworking around userHidden
				var vandal = $('#mw-diff-ntitle2').find('.mw-userlink')[0].text;
				var ntitle = document.getElementById('mw-diff-ntitle1').parentNode;
	
				ntitle.insertBefore(Twinkle.fluff.linkBuilder.rollbackLinks(vandal), ntitle.firstChild);
			}
		},
	
		oldid: function() { // Add a [restore this revision] link on old revisions
			var title = document.getElementById('mw-revision-info').parentNode;
			title.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgRevisionId'), title.firstChild);
		}
	};
	
	Twinkle.fluff.disableLinks = function disablelinks(parentNode) {
		// Array.from not available in IE11 :(
		$(parentNode).children().each(function(_ix, node) {
			node.innerHTML = node.textContent; // Feels like cheating
			$(node).css('font-weight', 'normal').css('color', 'darkgray');
		});
	};
	
	
	Twinkle.fluff.revert = function revertPage(type, vandal, rev, page) {
		if (mw.util.isIPv6Address(vandal)) {
			vandal = Morebits.sanitizeIPv6(vandal);
		}
	
		var pagename = page || mw.config.get('wgPageName');
		var revid = rev || mw.config.get('wgCurRevisionId');
	
		if (Twinkle.fluff.rollbackInPlace) {
			var notifyStatus = document.createElement('span');
			mw.notify(notifyStatus, {
				autoHide: false,
				title: 'Rollback on ' + page,
				tag: 'twinklefluff_' + rev // Shouldn't be necessary given disableLink
			});
			Morebits.status.init(notifyStatus);
		} else {
			Morebits.status.init(document.getElementById('mw-content-text'));
			$('#catlinks').remove();
		}
	
		var params = {
			type: type,
			user: vandal,
			userHidden: !vandal, // Keep track of whether the username was hidden
			pagename: pagename,
			revid: revid
		};
	
		var query = {
			'action': 'query',
			'prop': ['info', 'revisions', 'flagged'],
			'titles': pagename,
			'intestactions': 'edit',
			'rvlimit': Twinkle.getPref('revertMaxRevisions'),
			'rvprop': [ 'ids', 'timestamp', 'user' ],
			'curtimestamp': '',
			'meta': 'tokens',
			'type': 'csrf'
		};
		var wikipedia_api = new Morebits.wiki.api('Đang lấy dữ liệu của các sửa đổi trước đó', query, Twinkle.fluff.callbacks.main);
		wikipedia_api.params = params;
		wikipedia_api.post();
	};
	
	Twinkle.fluff.revertToRevision = function revertToRevision(oldrev) {
	
		Morebits.status.init(document.getElementById('mw-content-text'));
	
		var query = {
			'action': 'query',
			'prop': ['info', 'revisions'],
			'titles': mw.config.get('wgPageName'),
			'rvlimit': 1,
			'rvstartid': oldrev,
			'rvprop': [ 'ids', 'user' ],
			'format': 'xml',
			'curtimestamp': '',
			'meta': 'tokens',
			'type': 'csrf'
		};
		var wikipedia_api = new Morebits.wiki.api('Đang lấy dữ liệu của các sửa đổi trước đó', query, Twinkle.fluff.callbacks.toRevision);
		wikipedia_api.params = { rev: oldrev };
		wikipedia_api.post();
	};
	
	Twinkle.fluff.userIpLink = function(user) {
		return (mw.util.isIPAddress(user) ? '[[Đặc biệt:Đóng góp/' : '[[:User:') + user + '|' + user + ']]';
	};
	
	Twinkle.fluff.callbacks = {
		toRevision: function(apiobj) {
			var xmlDoc = apiobj.responseXML;
	
			var lastrevid = parseInt($(xmlDoc).find('page').attr('lastrevid'), 10);
			var touched = $(xmlDoc).find('page').attr('touched');
			var loadtimestamp = $(xmlDoc).find('api').attr('curtimestamp');
			var csrftoken = $(xmlDoc).find('tokens').attr('csrftoken');
			var revertToRevID = parseInt($(xmlDoc).find('rev').attr('revid'), 10);
	
			var revertToUser = $(xmlDoc).find('rev').attr('user');
			var revertToUserHidden = typeof $(xmlDoc).find('rev').attr('userhidden') === 'string';
	
			if (revertToRevID !== apiobj.params.rev) {
				apiobj.statelem.error('Sửa đổi đã truy xuất không khớp với phiên bản sửa đổi được yêu cầu. Đang dừng hồi sửa.');
				return;
			}
	
			var optional_summary = prompt('Vui lòng nêu lý do hồi sửa:                                ', '');  // padded out to widen prompt in Firefox
			if (optional_summary === null) {
				apiobj.statelem.error('Người dùng đã hủy bỏ.');
				return;
			}
	
			var summary = Twinkle.fluff.formatSummary('Hồi sửa về bản sửa đổi ' + revertToRevID + ' của $USER',
				revertToUserHidden ? null : revertToUser, optional_summary);
	
			var query = {
				'action': 'edit',
				'title': mw.config.get('wgPageName'),
				'summary': summary,
				'tags': Twinkle.changeTags,
				'token': csrftoken,
				'undo': lastrevid,
				'undoafter': revertToRevID,
				'basetimestamp': touched,
				'starttimestamp': loadtimestamp,
				'watchlist': Twinkle.getPref('watchRevertedPages').indexOf('torev') !== -1 ? 'watch' : undefined,
				'minor': Twinkle.getPref('markRevertedPagesAsMinor').indexOf('torev') !== -1 ? true : undefined
			};
	
			Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
			Morebits.wiki.actionCompleted.notice = 'Đã hồi sửa';
	
			var wikipedia_api = new Morebits.wiki.api('Đang lưu nội dung hồi sửa', query, Twinkle.fluff.callbacks.complete, apiobj.statelem);
			wikipedia_api.params = apiobj.params;
			wikipedia_api.post();
		},
		main: function(apiobj) {
			var xmlDoc = apiobj.responseXML;
	
			if (typeof $(xmlDoc).find('actions').attr('edit') === 'undefined') {
				apiobj.statelem.error("Không thể sửa đổi trang, có thể trang đã bị khóa.");
				return;
			}
	
			var lastrevid = parseInt($(xmlDoc).find('page').attr('lastrevid'), 10);
			var touched = $(xmlDoc).find('page').attr('touched');
			var loadtimestamp = $(xmlDoc).find('api').attr('curtimestamp');
			var csrftoken = $(xmlDoc).find('tokens').attr('csrftoken');
	
			var revs = $(xmlDoc).find('rev');
	
			var statelem = apiobj.statelem;
			var params = apiobj.params;
	
			if (revs.length < 1) {
				statelem.error('Chúng tôi có ít hơn một phiên bản sửa đổi bổ sung, do đó không thể hồi sửa.');
				return;
			}
			var top = revs[0];
			var lastuser = top.getAttribute('user');
	
			if (lastrevid < params.revid) {
				Morebits.status.error('Lỗi', [ 'ID phiên bản sửa đổi gần đây nhất đã nhận được từ máy chủ, ', Morebits.htmlNode('strong', lastrevid), ', nhỏ hơn ID của phiên bản sửa đổi được hiển thị. Điều này có thể cho thấy rằng phien bản sửa đổi hiện tại đã bị xóa, máy chủ đang bị chậm hoặc dữ liệu xấu đã được nhận. Đang dừng hồi sửa' ]);
				return;
			}
	
			// Used for user-facing alerts, messages, etc., not edits or summaries
			var userNorm = params.user || Twinkle.fluff.hiddenName;
			var index = 1;
			if (params.revid !== lastrevid) {
				Morebits.status.warn('Warning', [ 'Phiên bản sửa đổi mới nhất ', Morebits.htmlNode('strong', lastrevid), ' không giống phiên bản sửa đổi của chúng tôi ', Morebits.htmlNode('strong', params.revid) ]);
				if (lastuser === params.user) {
					switch (params.type) {
						case 'vand':
							Morebits.status.info('Thông tin', [ 'Phiên bản sửa đổi mới nhất đã được thực hiện bởi ', Morebits.htmlNode('strong', userNorm), '. Khi chúng tôi giả định là phá hoại, chúng tôi sẽ tiến hành hồi sửa.' ]);
							break;
						case 'agf':
							Morebits.status.warn('Cảnh báo', [ 'Phiên bản sửa đổi mới nhất đã được thực hiện bởi ', Morebits.htmlNode('strong', userNorm), '. Vì chúng tôi cho rằng có thiện chí, chúng tôi sẽ ngừng hồi sửa, vì sự cố có thể đã được khắc phục.' ]);
							return;
						default:
							Morebits.status.warn('Thông báo', [ 'Phiên bản sửa đổi mới nhất đã được thực hiện bởi ', Morebits.htmlNode('strong', userNorm), ', nhưng chúng tôi sẽ dừng việc hồi sửa.' ]);
							return;
					}
				} else if (params.type === 'vand' &&
						// Okay to test on user since it will either fail or sysop will correctly access it
						// Besides, none of the trusted bots are going to be revdel'd
						Twinkle.fluff.trustedBots.indexOf(top.getAttribute('user')) !== -1 && revs.length > 1 &&
						revs[1].getAttribute('pageId') === params.revid) {
					Morebits.status.info('Thông tin', [ 'Phiên bản sửa đổi mới nhất đã được thực hiện bởi ', Morebits.htmlNode('strong', lastuser), ', một bot đáng tin cậy và bản sửa đổi trước đó là do bị phá hoại, vì vậy chúng tôi sẽ tiến hành hồi sửa.' ]);
					index = 2;
				} else {
					Morebits.status.error('Lỗi', [ 'Phiên bản sửa đổi mới nhất đã được thực hiện bởi ', Morebits.htmlNode('strong', lastuser), ', vì vậy nó có thể đã được hồi sửa, chúng tôi sẽ dừng hồi sửa.']);
					return;
				}
	
			} else {
				// Expected revision is the same, so the users must match;
				// this allows sysops to know whether the users are the same
				params.user = lastuser;
				userNorm = params.user || Twinkle.fluff.hiddenName;
			}
	
			if (Twinkle.fluff.trustedBots.indexOf(params.user) !== -1) {
				switch (params.type) {
					case 'vand':
						Morebits.status.info('Thông tin', [ 'Đã hồi các sửa đổi phá hoại ', Morebits.htmlNode('strong', userNorm), '. Vì đây là một bot đáng tin cậy, thay vào đó chúng tôi cho rằng bạn muốn hồi sửa hành vi phá hoại do người dùng trước đó thực hiện.' ]);
						index = 2;
						params.user = revs[1].getAttribute('user');
						params.userHidden = revs[1].getAttribute('userhidden') === '';
						break;
					case 'agf':
						Morebits.status.warn('Thông báo', [ 'Đã hồi cấc sửa đổi thiện chí ', Morebits.htmlNode('strong', userNorm), '. Đây là một bot đáng tin cậy và do đó, quá trình lùi sửa thiện chí sẽ không được tiếp tục.' ]);
						return;
					case 'norm':
					/* falls through */
					default:
						var cont = confirm('Đã chọn hồi sửa sửa đổi của (' + userNorm + '), tuy nhiên đây là một bot đáng tin cậy. Bạn chắc chắn?');
						if (cont) {
							Morebits.status.info('Thông tin', [ 'Đã hồi các sửa đổi của ', Morebits.htmlNode('strong', userNorm), '. Đây là một bot đáng tin cậy, nhưng theo xác nhận, thay vào đó chúng tôi sẽ hồi sửa phiên bản sửa đổi trước đó.' ]);
							index = 2;
							params.user = revs[1].getAttribute('user');
							params.userHidden = revs[1].getAttribute('userhidden') === '';
							userNorm = params.user || Twinkle.fluff.hiddenName;
						} else {
							Morebits.status.warn('Thông báo', [ 'Đã hồi các sửa đổi của ', Morebits.htmlNode('strong', userNorm), '. Đây là một bot đáng tin cậy, nhưng theo xác nhận, việc hồi sửa trên phiên bản sửa đổi được chọn sẽ tiếp tục.' ]);
						}
						break;
				}
			}
			var found = false;
			var count = 0;
	
			for (var i = index; i < revs.length; ++i) {
				++count;
				if (revs[i].getAttribute('user') !== params.user) {
					found = i;
					break;
				}
			}
	
			if (!found) {
				statelem.error([ 'Không tìm thấy phiên bản sửa đổi trước. Có lẽ ', Morebits.htmlNode('strong', userNorm), ' là người đóng góp duy nhất, hoặc là thành viên đã tạo ra nhiều hơn ' + mw.language.convertNumber(Twinkle.getPref('revertMaxRevisions')) + ' sửa đổi liên tục.' ]);
				return;
			}
	
			if (!count) {
				Morebits.status.error('Lỗi', 'Đã dừng hồi sửa vì không thể hồi sửa 0 sửa đổi. Có thể đây là bản sửa đổi đã được hồi sửa, nhưng ID phiên bản sửa đổi vẫn như cũ.');
				return;
			}
	
			var good_revision = revs[found];
			var userHasAlreadyConfirmedAction = false;
			if (params.type !== 'vand' && count > 1) {
				if (!confirm(userNorm + ' đang thực hiện ' + mw.language.convertNumber(count) + ' sửa đổi liên tục. Bạn có chắc chắn muốn hồi sửa tất cả không?')) {
					Morebits.status.info('Thông báo', 'Đang dừng hồi sửa.');
					return;
				}
				userHasAlreadyConfirmedAction = true;
			}
	
			params.count = count;
	
			params.goodid = good_revision.getAttribute('revid');
			params.gooduser = good_revision.getAttribute('user');
			params.gooduserHidden = good_revision.getAttribute('userhidden') === '';
	
			statelem.status([ ' revision ', Morebits.htmlNode('strong', params.goodid), ' đã được thực hiện ', Morebits.htmlNode('strong', mw.language.convertNumber(count)), ' các phiên bản sửa đổi trước của ', Morebits.htmlNode('strong', params.gooduserHidden ? Twinkle.fluff.hiddenName : params.gooduser) ]);
	
			var summary, extra_summary;
			switch (params.type) {
				case 'agf':
					extra_summary = prompt('Nhập tóm lược sửa đổi:                              ', '');  // padded out to widen prompt in Firefox
					if (extra_summary === null) {
						statelem.error('Người dùng đã hủy bỏ.');
						return;
					}
					userHasAlreadyConfirmedAction = true;
	
					summary = Twinkle.fluff.formatSummary('Đã hồi sửa các sửa đổi [[Wikipedia:Giữ thiện ý|thiện chí]] của $USER',
						params.userHidden ? null : params.user, extra_summary);
					break;
	
				case 'vand':
					summary = Twinkle.fluff.formatSummary('Đã hồi sửa ' + params.count + (params.count > 1 ? ' sửa đổi' : ' sửa đổi') + ' của $USER đến bản sửa đổi cuối cùng của ' +
						(params.gooduserHidden ? Twinkle.fluff.hiddenName : params.gooduser), params.userHidden ? null : params.user);
					break;
	
				case 'norm':
				/* falls through */
				default:
					if (Twinkle.getPref('offerReasonOnNormalRevert')) {
						extra_summary = prompt('Nhập tóm lược sửa đổi:                              ', '');  // padded out to widen prompt in Firefox
						if (extra_summary === null) {
							statelem.error('Người dùng đã hủy bỏ.');
							return;
						}
						userHasAlreadyConfirmedAction = true;
					}
	
					summary = Twinkle.fluff.formatSummary('Đã hồi sửa ' + params.count + (params.count > 1 ? ' sửa đổi' : ' sửa đổi') + ' của $USER',
						params.userHidden ? null : params.user, extra_summary);
					break;
			}
	
			if (Twinkle.getPref('confirmOnFluff') && !userHasAlreadyConfirmedAction && !confirm('Hồi sửa trang: bạn có chắc không?')) {
				statelem.error('Tác vụ bị hủy bỏ bởi người dùng.');
				return;
			}
	
			// Decide whether to notify the user on success
			if (!Twinkle.fluff.skipTalk && Twinkle.getPref('openTalkPage').indexOf(params.type) !== -1 &&
					!params.userHidden && mw.config.get('wgUserName') !== params.user) {
				params.notifyUser = true;
				// Pass along to the warn module
				params.vantimestamp = top.getAttribute('timestamp');
			}
	
			// figure out whether we need to/can review the edit
			var $flagged = $(xmlDoc).find('flagged');
			if ((Morebits.userIsInGroup('reviewer') || Morebits.userIsSysop) &&
					$flagged.length &&
					$flagged.attr('stable_revid') >= params.goodid &&
					$flagged.attr('pending_since')) {
				params.reviewRevert = true;
				params.csrftoken = csrftoken;
			}
	
			var query = {
				'action': 'edit',
				'title': params.pagename,
				'summary': summary,
				'tags': Twinkle.changeTags,
				'token': csrftoken,
				'undo': lastrevid,
				'undoafter': params.goodid,
				'basetimestamp': touched,
				'starttimestamp': loadtimestamp,
				'watchlist': Twinkle.getPref('watchRevertedPages').indexOf(params.type) !== -1 ? 'watch' : undefined,
				'minor': Twinkle.getPref('markRevertedPagesAsMinor').indexOf(params.type) !== -1 ? true : undefined
			};
	
			if (!Twinkle.fluff.rollbackInPlace) {
				Morebits.wiki.actionCompleted.redirect = params.pagename;
			}
			Morebits.wiki.actionCompleted.notice = 'Đã lùi sửa';
	
			var wikipedia_api = new Morebits.wiki.api('Đang lưu nội dung đã hồi sửa', query, Twinkle.fluff.callbacks.complete, statelem);
			wikipedia_api.params = params;
			wikipedia_api.post();
	
		},
		complete: function (apiobj) {
			// TODO Most of this is copy-pasted from Morebits.wiki.page#fnSaveSuccess. Unify it
			var xml = apiobj.getXML();
			var $edit = $(xml).find('edit');
	
			if ($(xml).find('captcha').length > 0) {
				apiobj.statelem.error('Không thể lùi sửa vì máy chủ wiki muốn bạn điền vào CAPTCHA.');
			} else if ($edit.attr('nochange') === '') {
				apiobj.statelem.error('Tác vụ này đã bị hủy bỏ vì phiên bản được chọn giống với phiên bản hiện tại.');
			} else {
				apiobj.statelem.info('Đã xong');
				var params = apiobj.params;
	
				if (params.notifyUser && !params.userHidden) { // notifyUser only from main, not from toRevision
					Morebits.status.info('Thông tin', [ 'Đang mở biểu mẫu sửa đổi trang thảo luận thành viên ', Morebits.htmlNode('strong', params.user) ]);
	
					var windowQuery = {
						'title': 'Thảo luận Thành viên:' + params.user,
						'action': 'edit',
						'preview': 'yes',
						'vanarticle': params.pagename.replace(/_/g, ' '),
						'vanarticlerevid': params.revid,
						'vantimestamp': params.vantimestamp,
						'vanarticlegoodrevid': params.goodid,
						'type': params.type,
						'count': params.count
					};
	
					switch (Twinkle.getPref('userTalkPageMode')) {
						case 'tab':
							window.open(mw.util.getUrl('', windowQuery), '_blank');
							break;
						case 'blank':
							window.open(mw.util.getUrl('', windowQuery), '_blank',
								'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800');
							break;
						case 'window':
						/* falls through */
						default:
							window.open(mw.util.getUrl('', windowQuery),
								window.name === 'twinklewarnwindow' ? '_blank' : 'twinklewarnwindow',
								'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800');
							break;
					}
				}
	
	
				// Chức năng này không có tác dụng trên Wikipedia tiếng Việt do FlaggedRevisions chưa được cài đặt.
				// if (apiobj.params.reviewRevert) {
				//     var query = {
				//         'action': 'review',
				//         'revid': $edit.attr('newrevid'),
				//         'token': apiobj.params.csrftoken,
				//         'comment': 'Tự động xem xét đảo ngược' + Twinkle.summaryAd // until the below
				//         // 'tags': Twinkle.changeTags // flaggedrevs tag support: [[phab:T247721]]
				//     };
				//     var wikipedia_api = new Morebits.wiki.api('Tự động chấp nhận các thay đổi của bạn', query);
				//     wikipedia_api.post();
				// }
			}
		}
	};
	
	// If builtInString contains the string "$USER", it will be replaced
	// by an appropriate user link if a user name is provided
	Twinkle.fluff.formatSummary = function(builtInString, userName, customString) {
		var result = builtInString;
	
		// append user's custom reason
		if (customString) {
			result += ': ' + Morebits.string.toUpperCaseFirstChar(customString);
		}
	
		// find number of UTF-8 bytes the resulting string takes up, and possibly add
		// a contributions or contributions+talk link if it doesn't push the edit summary
		// over the 499-byte limit
		if (/\$USER/.test(builtInString)) {
			if (userName) {
				var resultLen = unescape(encodeURIComponent(result.replace('$USER', ''))).length;
				var contribsLink = '[[Đặc biệt:Đóng góp/' + userName + '|' + userName + ']]';
				var contribsLen = unescape(encodeURIComponent(contribsLink)).length;
				if (resultLen + contribsLen <= 499) {
					var talkLink = ' ([[Thảo luận Thành viên:' + userName + '|thảo luận]])';
					if (resultLen + contribsLen + unescape(encodeURIComponent(talkLink)).length <= 499) {
						result = Morebits.string.safeReplace(result, '$USER', contribsLink + talkLink);
					} else {
						result = Morebits.string.safeReplace(result, '$USER', contribsLink);
					}
				} else {
					result = Morebits.string.safeReplace(result, '$USER', userName);
				}
			} else {
				result = Morebits.string.safeReplace(result, '$USER', Twinkle.fluff.hiddenName);
			}
		}
	
		return result;
	};
	
	Twinkle.addInitCallback(Twinkle.fluff, 'fluff');
	})(jQuery);
	
	
	// </nowiki>
	