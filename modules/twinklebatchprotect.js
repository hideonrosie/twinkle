// <nowiki>


(function($) {


	/*
	 ****************************************
	 *** twinklebatchprotect.js: Batch protect module (chỉ dành cho bảo quản viên/điều phối viên)
	 ****************************************
	 * Mode of invocation:     Tab ("Khóa trang hàng loạt")
	 * Active on:              Existing project pages and user pages; existing and
	 *                         non-existing categories; Special:PrefixIndex
	 */
	
	
	Twinkle.batchprotect = function twinklebatchprotect() {
		if ((Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) && ((mw.config.get('wgArticleId') > 0 && (mw.config.get('wgNamespaceNumber') === 2 ||
			mw.config.get('wgNamespaceNumber') === 4)) || mw.config.get('wgNamespaceNumber') === 14 ||
			mw.config.get('wgCanonicalSpecialPageName') === 'Prefixindex')) {
			Twinkle.addPortletLink(Twinkle.batchprotect.callback, 'Khóa trang hàng loạt', 'tw-pbatch', 'Protect pages linked from this page');
		}
	};
	
	Twinkle.batchprotect.unlinkCache = {};
	Twinkle.batchprotect.callback = function twinklebatchprotectCallback() {
		var Window = new Morebits.simpleWindow(600, 400);
		Window.setTitle('Khóa trang hàng loạt');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Quy định khóa trang', 'WP:PROT');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#khóa');
	
		var form = new Morebits.quickForm(Twinkle.batchprotect.callback.evaluate);
		form.append({
			type: 'checkbox',
			event: Twinkle.protect.formevents.editmodify,
			list: [
				{
					label: 'Thay đổi khóa sửa đổi',
					value: 'editmodify',
					name: 'editmodify',
					tooltip: 'Chỉ dành cho các trang đang tồn tại.',
					checked: true
				}
			]
		});
		form.append({
			type: 'select',
			name: 'editlevel',
			label: 'Khóa sửa đổi:',
			event: Twinkle.protect.formevents.editlevel,
			list: Twinkle.protect.protectionLevels
		});
		form.append({
			type: 'select',
			name: 'editexpiry',
			label: 'Hết hạn:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Twinkle.protect.doCustomExpiry(e.target);
				}
			},
			list: Twinkle.protect.protectionLengths // Default (2 days) set after render
		});
	
		form.append({
			type: 'checkbox',
			event: Twinkle.protect.formevents.movemodify,
			list: [
				{
					label: 'Thay đổi khóa di chuyển',
					value: 'movemodify',
					name: 'movemodify',
					tooltip: 'Chỉ dành cho các trang đang tồn tại.',
					checked: true
				}
			]
		});
		form.append({
			type: 'select',
			name: 'movelevel',
			label: 'Khóa di chuyển:',
			event: Twinkle.protect.formevents.movelevel,
			list: Twinkle.protect.protectionLevels.filter(function(level) {
				// Autoconfirmed is required for a move, redundant
				return level.value !== 'autoconfirmed';
			})
		});
		form.append({
			type: 'select',
			name: 'moveexpiry',
			label: 'Hết hạn:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Twinkle.protect.doCustomExpiry(e.target);
				}
			},
			list: Twinkle.protect.protectionLengths // Default (2 days) set after render
		});
	
		form.append({
			type: 'checkbox',
			event: function twinklebatchprotectFormCreatemodifyEvent(e) {
				e.target.form.createlevel.disabled = !e.target.checked;
				e.target.form.createexpiry.disabled = !e.target.checked || (e.target.form.createlevel.value === 'all');
				e.target.form.createlevel.style.color = e.target.form.createexpiry.style.color = e.target.checked ? '' : 'transparent';
			},
			list: [
				{
					label: 'Thay đổi khóa tạo trang',
					value: 'createmodify',
					name: 'createmodify',
					tooltip: 'Chỉ dành cho các trang chưa tồn tại.',
					checked: true
				}
			]
		});
		form.append({
			type: 'select',
			name: 'createlevel',
			label: 'Tạo khóa:',
			event: Twinkle.protect.formevents.createlevel,
			list: Twinkle.protect.protectionLevels
		});
		form.append({
			type: 'select',
			name: 'createexpiry',
			label: 'Hết hạn:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Twinkle.protect.doCustomExpiry(e.target);
				}
			},
			list: Twinkle.protect.protectionLengths // Default (indefinite) set after render
		});
	
		form.append({
			type: 'header',
			label: ''  // horizontal rule
		});
		form.append({
			type: 'input',
			name: 'reason',
			label: 'Lý do: ',
			size: 60,
			tooltip: 'Dành cho nhật trình khóa trang và lịch sử trang.'
		});
	
		var query = {
			'action': 'query',
			'prop': 'revisions|info',
			'rvprop': 'size',
			'inprop': 'protection'
		};
	
		if (mw.config.get('wgNamespaceNumber') === 14) {  // categories
			query.generator = 'categorymembers';
			query.gcmtitle = mw.config.get('wgPageName');
			query.gcmlimit = Twinkle.getPref('batchMax');
		} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Prefixindex') {
			query.generator = 'allpages';
			query.gapnamespace = mw.util.getParamValue('namespace') || $('select[name=namespace]').val();
			query.gapprefix = mw.util.getParamValue('prefix') || $('input[name=prefix]').val();
			query.gaplimit = Twinkle.getPref('batchMax');
		} else {
			query.generator = 'links';
			query.titles = mw.config.get('wgPageName');
			query.gpllimit = Twinkle.getPref('batchMax');
		}
	
		var statusdiv = document.createElement('div');
		statusdiv.style.padding = '15px';  // just so it doesn't look broken
		Window.setContent(statusdiv);
		Morebits.status.init(statusdiv);
		Window.display();
	
		var statelem = new Morebits.status('Đang lấy danh sách trang');
	
		var wikipedia_api = new Morebits.wiki.api('đang tải...', query, function(apiobj) {
			var xml = apiobj.responseXML;
			var $pages = $(xml).find('page');
			var list = [];
			$pages.each(function(index, page) {
				var $page = $(page);
				var title = $page.attr('title');
				var isRedir = $page.attr('redirect') === ''; // XXX ??
				var missing = $page.attr('missing') === ''; // XXX ??
				var size = $page.find('rev').attr('size');
				var $editProt;
	
				var metadata = [];
				if (missing) {
					metadata.push('page does not exist');
					$editProt = $page.find('pr[type="create"][level="sysop"]');
				} else {
					if (isRedir) {
						metadata.push('redirect');
					}
					metadata.push(mw.language.convertNumber(size) + ' bytes');
					$editProt = $page.find('pr[type="edit"][level="sysop"]');
				}
				if ($editProt.length > 0) {
					metadata.push('fully' + (missing ? ' create' : '') + ' protected' +
					($editProt.attr('expiry') === 'infinity' ? ' indefinitely' : ', expires ' + new Morebits.date($editProt.attr('expiry')).calendar('utc') + ' (UTC)'));
				}
	
				list.push({ label: title + (metadata.length ? ' (' + metadata.join('; ') + ')' : ''), value: title, checked: true, style: $editProt.length > 0 ? 'color:red' : '' });
			});
			form.append({ type: 'header', label: 'Các trang cần khóa' });
			form.append({
				type: 'button',
				label: 'Chọn tất cả',
				event: function(e) {
					$(Morebits.quickForm.getElements(e.target.form, 'pages')).prop('checked', true);
				}
			});
			form.append({
				type: 'button',
				label: 'Bỏ chọn tất cả',
				event: function(e) {
					$(Morebits.quickForm.getElements(e.target.form, 'pages')).prop('checked', false);
				}
			});
			form.append({
				type: 'checkbox',
				name: 'pages',
				shiftClickSupport: true,
				list: list
			});
			form.append({ type: 'submit' });
	
			var result = form.render();
			Window.setContent(result);
	
			// Set defaults
			form.editexpiry.value = '2 days';
			form.moveexpiry.value = '2 days';
			form.createexpiry.value = 'indefinite';
	
	
		}, statelem);
	
		wikipedia_api.post();
	};
	
	Twinkle.batchprotect.currentProtectCounter = 0;
	Twinkle.batchprotect.currentprotector = 0;
	Twinkle.batchprotect.callback.evaluate = function twinklebatchprotectCallbackEvaluate(event) {
		Morebits.wiki.actionCompleted.notice = 'Khóa trang hàng loạt hiện đã hoàn tất';
	
		var form = event.target;
	
		var numProtected = $(Morebits.quickForm.getElements(form, 'pages')).filter(function(index, element) {
			return element.checked && element.nextElementSibling.style.color === 'red';
		}).length;
		if (numProtected > 0 && !confirm('Bạn sắp khóa ' + mw.language.convertNumber(numProtected) + ' (các) trang được khóa hoàn toàn. Bạn có chắc không?')) {
			return;
		}
	
		var input = Morebits.quickForm.getInputData(form);
	
		if (!input.reason) {
			alert("Bạn phải đưa ra lý do!");
			return;
		}
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);
	
		if (input.pages.length === 0) {
			Morebits.status.error('Lỗi', 'Không có gì để khóa, đang hủy bỏ tác vụ');
			return;
		}
	
		var batchOperation = new Morebits.batchOperation('Đang áp dụng các thiết lập khóa');
		batchOperation.setOption('chunkSize', Twinkle.getPref('batchChunks'));
		batchOperation.setOption('preserveIndividualStatusLines', true);
		batchOperation.setPageList(input.pages);
		batchOperation.run(function(pageName) {
			var query = {
				'action': 'query',
				'titles': pageName
			};
			var wikipedia_api = new Morebits.wiki.api('Đang kiểm tra nếu trang ' + pageName + ' tồn tại', query,
				Twinkle.batchprotect.callbacks.main, null, batchOperation.workerFailure);
			wikipedia_api.params = $.extend({
				page: pageName,
				batchOperation: batchOperation
			}, input);
			wikipedia_api.post();
		});
	};
	
	Twinkle.batchprotect.callbacks = {
		main: function(apiobj) {
			var xml = apiobj.responseXML;
			var normal = $(xml).find('normalized n').attr('to');
			if (normal) {
				apiobj.params.page = normal;
			}
	
			var exists = $(xml).find('page').attr('missing') !== '';
	
			var page = new Morebits.wiki.page(apiobj.params.page, 'Đang khóa ' + apiobj.params.page);
			var takenAction = false;
			if (exists && apiobj.params.editmodify) {
				page.setEditProtection(apiobj.params.editlevel, apiobj.params.editexpiry);
				takenAction = true;
			}
			if (exists && apiobj.params.movemodify) {
				page.setMoveProtection(apiobj.params.movelevel, apiobj.params.moveexpiry);
				takenAction = true;
			}
			if (!exists && apiobj.params.createmodify) {
				page.setCreateProtection(apiobj.params.createlevel, apiobj.params.createexpiry);
				takenAction = true;
			}
			if (!takenAction) {
				Morebits.status.warn('Đang khóa ' + apiobj.params.page, 'trang ' + (exists ? 'exists' : 'does not exist') + '; không có gì để làm, bỏ qua');
				apiobj.params.batchOperation.workerFailure(apiobj);
				return;
			}
	
			page.setEditSummary(apiobj.params.reason);
			page.setChangeTags(Twinkle.changeTags);
			page.protect(apiobj.params.batchOperation.workerSuccess, apiobj.params.batchOperation.workerFailure);
		}
	};
	
	Twinkle.addInitCallback(Twinkle.batchprotect, 'batchprotect');
	})(jQuery);
	
	
	// </nowiki>
	