// <nowiki>


(function($) {


	/*
	 ****************************************
	 *** twinklespeedy.js: CSD module
	 ****************************************
	 * Mode of invocation:     Tab ("Xóa nhanh")
	 * Active on:              Non-special, existing pages
	 *
	 * NOTE FOR DEVELOPERS:
	 *   If adding a new criterion, add it to the appropriate places at the top of
	 *   twinkleconfig.js.  Also check out the default values of the CSD preferences
	 *   in twinkle.js, and add your new criterion to those if you think it would be
	 *   good.
	 */
	
	Twinkle.speedy = function twinklespeedy() {
		// Disable on:
		// * special pages
		// * non-existent pages
		if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
			return;
		}
	
		Twinkle.addPortletLink(Twinkle.speedy.callback, 'Xóa nhanh', 'tw-csd', Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? 'Xóa trang theo WP:TCXN' : 'Đề nghị xóa nhanh theo WP:XN');
	};
	
	// This function is run when the CSD tab/header link is clicked
	Twinkle.speedy.callback = function twinklespeedyCallback() {
		Twinkle.speedy.initDialog(Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? Twinkle.speedy.callback.evaluateSysop : Twinkle.speedy.callback.evaluateUser, true);
	};
	
	// Used by unlink feature
	Twinkle.speedy.dialog = null;
	// Used throughout
	Twinkle.speedy.hasCSD = !!$('#delete-reason').length;
	
	// The speedy criteria list can be in one of several modes
	Twinkle.speedy.mode = {
		sysopSingleSubmit: 1,  // radio buttons, no subgroups, submit when "Submit" button is clicked
		sysopRadioClick: 2,  // radio buttons, no subgroups, submit when a radio button is clicked
		sysopMultipleSubmit: 3, // check boxes, subgroups, "Submit" button already present
		sysopMultipleRadioClick: 4, // check boxes, subgroups, need to add a "Submit" button
		userMultipleSubmit: 5,  // check boxes, subgroups, "Submit" button already pressent
		userMultipleRadioClick: 6,  // check boxes, subgroups, need to add a "Submit" button
		userSingleSubmit: 7,  // radio buttons, subgroups, submit when "Submit" button is clicked
		userSingleRadioClick: 8,  // radio buttons, subgroups, submit when a radio button is clicked
	
		// are we in "delete page" mode?
		// (sysops can access both "delete page" [sysop] and "tag page only" [user] modes)
		isSysop: function twinklespeedyModeIsSysop(mode) {
			return mode === Twinkle.speedy.mode.sysopSingleSubmit ||
				mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
				mode === Twinkle.speedy.mode.sysopRadioClick ||
				mode === Twinkle.speedy.mode.sysopMultipleRadioClick;
		},
		// do we have a "Submit" button once the form is created?
		hasSubmitButton: function twinklespeedyModeHasSubmitButton(mode) {
			return mode === Twinkle.speedy.mode.sysopSingleSubmit ||
				mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
				mode === Twinkle.speedy.mode.sysopMultipleRadioClick ||
				mode === Twinkle.speedy.mode.userMultipleSubmit ||
				mode === Twinkle.speedy.mode.userMultipleRadioClick ||
				mode === Twinkle.speedy.mode.userSingleSubmit;
		},
		// is db-multiple the outcome here?
		isMultiple: function twinklespeedyModeIsMultiple(mode) {
			return mode === Twinkle.speedy.mode.userMultipleSubmit ||
				mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
				mode === Twinkle.speedy.mode.userMultipleRadioClick ||
				mode === Twinkle.speedy.mode.sysopMultipleRadioClick;
		}
	};
	
	// Prepares the speedy deletion dialog and displays it
	Twinkle.speedy.initDialog = function twinklespeedyInitDialog(callbackfunc) {
		var dialog;
		Twinkle.speedy.dialog = new Morebits.simpleWindow(Twinkle.getPref('speedyWindowWidth'), Twinkle.getPref('speedyWindowHeight'));
		dialog = Twinkle.speedy.dialog;
		dialog.setTitle('Chọn tiêu chí xóa nhanh');
		dialog.setScriptName('Twinkle');
		dialog.addFooterLink('Quy định xóa nhanh', 'WP:TCXN');
		dialog.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#xóa_nhanh');
	
		var form = new Morebits.quickForm(callbackfunc, Twinkle.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null);
		if (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) {
			form.append({
				type: 'checkbox',
				list: [
					{
						label: 'Chỉ gắn thẻ trang, không xóa',
						value: 'tag_only',
						name: 'tag_only',
						tooltip: 'Chọn tùy chọn này nếu bạn chỉ muốn gắn thẻ trang thay vì xóa nhanh ngay lúc này.',
						checked: !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
						event: function(event) {
							var cForm = event.target.form;
							var cChecked = event.target.checked;
							// enable talk page checkbox
							if (cForm.talkpage) {
								cForm.talkpage.checked = !cChecked && Twinkle.getPref('deleteTalkPageOnDelete');
							}
							// enable redirects checkbox
							cForm.redirects.checked = !cChecked;
							// enable delete multiple
							cForm.delmultiple.checked = false;
							// enable notify checkbox
							cForm.notify.checked = cChecked;
							// enable deletion notification checkbox
							cForm.warnusertalk.checked = !cChecked && !Twinkle.speedy.hasCSD;
							// enable multiple
							cForm.multiple.checked = false;
							// enable requesting creation protection
							cForm.salting.checked = false;
	
							Twinkle.speedy.callback.modeChanged(cForm);
	
							event.stopPropagation();
						}
					}
				]
			});
	
			var deleteOptions = form.append({
				type: 'div',
				name: 'delete_options'
			});
			deleteOptions.append({
				type: 'header',
				label: 'Các tùy chọn liên quan đến việc xóa trang'
			});
			if (mw.config.get('wgNamespaceNumber') % 2 === 0 && (mw.config.get('wgNamespaceNumber') !== 2 || (/\//).test(mw.config.get('wgTitle')))) {  // ẩn chức năng đối với trang thành viên để BQV và ĐPV không xóa nhầm thảo luận thành viên
				deleteOptions.append({
					type: 'checkbox',
					list: [
						{
							label: 'Đồng thời xóa trang thảo luận',
							value: 'talkpage',
							name: 'talkpage',
							tooltip: "Tùy chọn này sẽ xóa thêm trang thảo luận của trang.",
							checked: Twinkle.getPref('deleteTalkPageOnDelete'),
							event: function(event) {
								event.stopPropagation();
							}
						}
					]
				});
			}
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: 'Đồng thời xóa tất cả các trang đổi hướng',
						value: 'redirects',
						name: 'redirects',
						tooltip: 'Tùy chọn này cũng xóa thêm tất cả các trang đổi hướng đến. Hãy tránh dùng tùy chọn này cho các tác vụ xóa theo thủ tục (ví dụ: di chuyển/hợp nhất).',
						checked: Twinkle.getPref('deleteRedirectsOnDelete'),
						event: function(event) {
							event.stopPropagation();
						}
					}
				]
			});
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: 'Xóa theo nhiều tiêu chí',
						value: 'delmultiple',
						name: 'delmultiple',
						tooltip: 'Chọn chức năng này nếu bạn muốn áp dụng nhiều tiêu chí cho trang sẽ bị xóa.',
						event: function(event) {
							Twinkle.speedy.callback.modeChanged(event.target.form);
							event.stopPropagation();
						}
					}
				]
			});
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: 'Thông báo cho người tạo trang về việc xóa trang',
						value: 'warnusertalk',
						name: 'warnusertalk',
						tooltip: 'Một bản mẫu thông báo sẽ được đặt trên trang thảo luận của người tạo trang, người tạo trang cũng có thể được thông báo.',
						// checked: !Twinkle.speedy.hasCSD,
						checked: true, // đặt thẳng là true không cần qua cấu hình ở Twinkle
						event: function(event) {
							event.stopPropagation();
						}
					}
				]
			});
		}
	
		var tagOptions = form.append({
			type: 'div',
			name: 'tag_options'
		});
	
		if (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) {
			tagOptions.append({
				type: 'header',
				label: 'Các tùy chọn liên quan đến thẻ'
			});
		}
	
		tagOptions.append({
			type: 'checkbox',
			list: [
				{
					label: 'Thông báo cho người tạo trang nếu có thể',
					value: 'notify',
					name: 'notify',
					tooltip: 'Một bản mẫu thông báo sẽ được đặt trên trang thảo luận của người tạo trang. Người tạo trang cũng có thể được chào mừng.',
					//checked: !Morebits.userIsSysop || !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
					checked: true, // đặt thẳng là true không cần qua cấu hình ở Twinkle
					event: function(event) {
						event.stopPropagation();
					}
				}
			]
		});
		tagOptions.append({
			type: 'checkbox',
			list: [
				{
					label: 'Gắn thẻ để khóa khởi tạo trang',
					value: 'salting',
					name: 'salting',
					tooltip: 'Khi được chọn, thẻ xóa nhanh sẽ được đặt kèm theo thẻ {{salt}} để yêu cầu bảo quản viên hoặc điều phối viên khi xóa trang kích hoạt thêm chức năng khóa khởi tạo trang. Chỉ nên chọn chức năng này nếu trang bị xóa được tạo đi tạo lại nhiều lần.',
					event: function(event) {
						event.stopPropagation();
					}
				}
			]
		});
		tagOptions.append({
			type: 'checkbox',
			list: [
				{
					label: 'Gắn thẻ với nhiều tiêu chí',
					value: 'multiple',
					name: 'multiple',
					tooltip: 'Chọn chức năng này nếu bạn muốn áp dụng nhiều tiêu chí cho trang sẽ bị xóa.',
					event: function(event) {
						Twinkle.speedy.callback.modeChanged(event.target.form);
						event.stopPropagation();
					}
				}
			]
		});
	
		form.append({
			type: 'div',
			name: 'work_area',
			label: 'Không thể khởi chạy mô đun CSD. Vui lòng thử lại hoặc báo với các bảo trì viên Twinkle về vấn đề này.'
		});
	
		if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
			form.append({ type: 'submit', className: 'tw-speedy-submit' }); // Renamed in modeChanged
		}
	
		var result = form.render();
		dialog.setContent(result);
		dialog.display();
	
		Twinkle.speedy.callback.modeChanged(result);
	};
	
	Twinkle.speedy.callback.getMode = function twinklespeedyCallbackGetMode(form) {
		var mode = Twinkle.speedy.mode.userSingleSubmit;
		if (form.tag_only && !form.tag_only.checked) {
			if (form.delmultiple.checked) {
				mode = Twinkle.speedy.mode.sysopMultipleSubmit;
			} else {
				mode = Twinkle.speedy.mode.sysopSingleSubmit;
			}
		} else {
			if (form.multiple.checked) {
				mode = Twinkle.speedy.mode.userMultipleSubmit;
			} else {
				mode = Twinkle.speedy.mode.userSingleSubmit;
			}
		}
		if (Twinkle.getPref('speedySelectionStyle') === 'radioClick') {
			mode++;
		}
	
		return mode;
	};
	
	Twinkle.speedy.callback.modeChanged = function twinklespeedyCallbackModeChanged(form) {
		var namespace = mw.config.get('wgNamespaceNumber');
	
		// first figure out what mode we're in
		var mode = Twinkle.speedy.callback.getMode(form);
		var isSysopMode = Twinkle.speedy.mode.isSysop(mode);
	
		if (isSysopMode) {
			$('[name=delete_options]').show();
			$('[name=tag_options]').hide();
			$('button.tw-speedy-submit').text('Xóa trang');
		} else {
			$('[name=delete_options]').hide();
			$('[name=tag_options]').show();
			$('button.tw-speedy-submit').text('Gắn thẻ trang');
		}
	
		var work_area = new Morebits.quickForm.element({
			type: 'div',
			name: 'work_area'
		});
	
		if (mode === Twinkle.speedy.mode.userMultipleRadioClick || mode === Twinkle.speedy.mode.sysopMultipleRadioClick) {
			var evaluateType = isSysopMode ? 'evaluateSysop' : 'evaluateUser';
	
			work_area.append({
				type: 'div',
				label: 'Khi chọn xong tiêu chí, hãy nhấp vào:'
			});
			work_area.append({
				type: 'button',
				name: 'submit-multiple',
				label: isSysopMode ? 'Xóa trang' : 'Gắn thẻ trang',
				event: function(event) {
					Twinkle.speedy.callback[evaluateType](event);
					event.stopPropagation();
				}
			});
		}
	
		var radioOrCheckbox = Twinkle.speedy.mode.isMultiple(mode) ? 'checkbox' : 'radio';
	
		if (isSysopMode && !Twinkle.speedy.mode.isMultiple(mode)) {
			work_area.append({ type: 'header', label: 'Tiêu chí tùy chọn' });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.customRationale, mode) });
		}
	
		if (namespace % 2 === 1 && namespace !== 3) {
			// show db-talk on talk pages, but not user talk pages
			work_area.append({ type: 'header', label: 'Trang thảo luận' });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.talkList, mode) });
		}
	
		if (!mw.config.get('wgIsRedirect')) {
			switch (namespace) {
				case 0:  // article
				case 1:  // talk
					work_area.append({ type: 'header', label: 'Bài viết' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.articleList, mode) });
					break;
	
				case 2:  // user
				case 3:  // user talk
					work_area.append({ type: 'header', label: 'Trang thành viên' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.userList, mode) });
					break;
	
				case 6:  // file
				case 7:  // file talk
					work_area.append({ type: 'header', label: 'Tập tin' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.fileList, mode) });
					if (!isSysopMode) {
						work_area.append({ type: 'div', label: 'Gắn thẻ cho CSD TT4 (Thiếu thông tin cấp phép), TT5 (Tập tin không tự do nhưng không được sử dụng), TT6 (Thiếu lý do sử dụng hợp lý với tập tin không tự do), và T11 ( Không có bằng chứng về việc cho phép sử dụng) có thể được thực hiện bằng cách sử dụng Tab "Đề nghị xóa hình" của Twinkle.' });
					}
					break;
	
				case 10:  // template
				case 11:  // template talk
					work_area.append({ type: 'header', label: 'Bản mẫu/Mô đun' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.templateList, mode) });
					break;
	
				case 14:  // category
				case 15:  // category talk
					work_area.append({ type: 'header', label: 'Thể loại' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.categoryList, mode) });
					break;
	
				case 100:  // portal
				case 101:  // portal talk
					work_area.append({ type: 'header', label: 'Cổng thông tin' });
					work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.portalList, mode) });
					break; 
	
				default:
					break;
			}
		} else {
			if (namespace === 2 || namespace === 3) {
				work_area.append({ type: 'header', label: 'Trang thành viên' });
				work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.userList, mode) });
			}
			work_area.append({ type: 'header', label: 'Trang đổi hướng' });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.redirectList, mode) });
		}
	
		var generalCriteria = Twinkle.speedy.generalList;
	
		// custom rationale lives under general criteria when tagging
		if (!isSysopMode) {
			generalCriteria = Twinkle.speedy.customRationale.concat(generalCriteria);
		}
		work_area.append({ type: 'header', label: 'Tiêu chí chung' });
		work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(generalCriteria, mode) });
	
		var old_area = Morebits.quickForm.getElements(form, 'work_area')[0];
		form.replaceChild(work_area.render(), old_area);
	
		// if sysop, check if CSD is already on the page and fill in custom rationale
		if (isSysopMode && Twinkle.speedy.hasCSD) {
			var customOption = $('input[name=csd][value=reason]')[0];
			if (customOption) {
				if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
					// force listeners to re-init
					customOption.click();
					customOption.parentNode.appendChild(customOption.subgroup);
				}
				customOption.subgroup.querySelector('input').value = decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ');
			}
		}
	};
	
	Twinkle.speedy.generateCsdList = function twinklespeedyGenerateCsdList(list, mode) {
		// mode switches
		var isSysopMode = Twinkle.speedy.mode.isSysop(mode);
		var multiple = Twinkle.speedy.mode.isMultiple(mode);
		var hasSubmitButton = Twinkle.speedy.mode.hasSubmitButton(mode);
		var pageNamespace = mw.config.get('wgNamespaceNumber');
	
		var openSubgroupHandler = function(e) {
			$(e.target.form).find('input').prop('disabled', true);
			$(e.target.form).children().css('color', 'gray');
			$(e.target).parent().css('color', 'black').find('input').prop('disabled', false);
			$(e.target).parent().find('input:text')[0].focus();
			e.stopPropagation();
		};
		var submitSubgroupHandler = function(e) {
			var evaluateType = Twinkle.speedy.mode.isSysop(mode) ? 'evaluateSysop' : 'evaluateUser';
			Twinkle.speedy.callback[evaluateType](e);
			e.stopPropagation();
		};
	
		return $.map(list, function(critElement) {
			var criterion = $.extend({}, critElement);
	
			if (multiple) {
				if (criterion.hideWhenMultiple) {
					return null;
				}
				if (criterion.hideSubgroupWhenMultiple) {
					criterion.subgroup = null;
				}
			} else {
				if (criterion.hideWhenSingle) {
					return null;
				}
				if (criterion.hideSubgroupWhenSingle) {
					criterion.subgroup = null;
				}
			}
	
			if (isSysopMode) {
				if (criterion.hideWhenSysop) {
					return null;
				}
				if (criterion.hideSubgroupWhenSysop) {
					criterion.subgroup = null;
				}
			} else {
				if (criterion.hideWhenUser) {
					return null;
				}
				if (criterion.hideSubgroupWhenUser) {
					criterion.subgroup = null;
				}
			}
	
			if (mw.config.get('wgIsRedirect') && criterion.hideWhenRedirect) {
				return null;
			}
	
			if (criterion.showInNamespaces && criterion.showInNamespaces.indexOf(pageNamespace) < 0) {
				return null;
			}
			if (criterion.hideInNamespaces && criterion.hideInNamespaces.indexOf(pageNamespace) > -1) {
				return null;
			}
	
			if (criterion.subgroup && !hasSubmitButton) {
				if (Array.isArray(criterion.subgroup)) {
					criterion.subgroup = criterion.subgroup.concat({
						type: 'button',
						name: 'submit',
						label: isSysopMode ? 'Xóa trang' : 'Gắn thẻ trang',
						event: submitSubgroupHandler
					});
				} else {
					criterion.subgroup = [
						criterion.subgroup,
						{
							type: 'button',
							name: 'submit',  // ends up being called "csd.submit" so this is OK
							label: isSysopMode ? 'Xóa trang' : 'Gắn thẻ trang',
							event: submitSubgroupHandler
						}
					];
				}
				// FIXME: does this do anything?
				criterion.event = openSubgroupHandler;
			}
	
			return criterion;
		});
	};
	
	Twinkle.speedy.customRationale = [
		{
			label: 'Tiêu chí tùy chọn' + (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? ' (lý do xóa tùy chọn)' : ' sử dụng bản mẫu {{db}}'),
			value: 'reason',
			tooltip: 'Tên bản mẫu {{db}} là viết tắt của "xóa bởi vì" (delete because). Trang sắp bị xóa phải được áp dụng tối thiểu một trong các tiêu chí xóa nhanh với lý do hợp lý. Lưu ý đây không phải là tiêu chí "chung cho tất cả trường hợp" khi bạn không thể tìm thấy bất kỳ tiêu chí xóa nhanh nào phù hợp.',
			subgroup: {
				name: 'reason_1',
				type: 'input',
				label: 'Lý do: ',
				size: 60
			},
			hideWhenMultiple: true
		}
	];
	
	Twinkle.speedy.talkList = [
		{
			label: 'C8: Các trang thảo luận không có trang chủ đề tương ứng',
			value: 'talk',
			tooltip: 'Tiêu chí này không bao gồm bất kỳ trang nào hữu ích cho dự án - cụ thể là các trang thảo luận của thành viên, trang lưu trữ trang thảo luận và các trang thảo luận của các tập tin đang tồn tại ở Wikimedia Commons.'
		}
	];
	
	// Tiêu chí dành cho tập tin chưa có ở dự án viwiki
	Twinkle.speedy.fileList = [
		{
			label: 'TT1: Tập tin dư thừa',
			value: 'redundantimage',
			tooltip: 'Bất kỳ tập tin nào là bản sao dư thừa, ở cùng một định dạng tập tin và cùng độ phân giải hoặc thấp hơn, của một tập tin khác trên Wikipedia. Tương tự như vậy, các phương tiện khác là bản sao dự phòng, có cùng định dạng và chất lượng tương đương hoặc thấp hơn. Điều này không áp dụng cho các tập tin được sao chép ở Wikimedia Commons vì các vấn đề về giấy phép; thay vào đó, tập tin phải được gắn thẻ {{subst:ncd|Hình ảnh:tên tập tin mới.đuôi mở rộng}} hoặc {{subst:ncd}}',
			subgroup: {
				name: 'redundantimage_filename',
				type: 'input',
				label: 'Tập tin dư thừa là vì: ',
				tooltip: 'Tiến tố "Tập tin:" có thể bỏ qua.'
			}
		},
		{
			label: 'TT2: Tập tin bị hỏng, thất lạc hoặc trống',
			value: 'noimage',
			tooltip: 'Trước khi xóa loại tập tin này, hãy xác minh rằng phần mềm MediaWiki không thể đọc tập tin bằng cách xem trước hình thu nhỏ đã thay đổi kích thước của tập tin. Điều này cũng bao gồm các trang mô tả tập tin trống (tức là không có nội dung) cho các tập tin Commons'
		},
		{
			label: 'TT3: Giấy phép không phù hợp',
			value: 'noncom',
			tooltip: 'Các tập tin được cấp phép là "chỉ sử dụng cho mục đích phi thương mại", "sử dụng phi phái sinh" hoặc "được sử dụng với sự cho phép" đã được tải lên vào hoặc sau ngày 5 tháng 5 năm 2005, ngoại trừ trường hợp chúng được chứng minh là tuân thủ các tiêu chuẩn hạn chế cho sử dụng nội dung không miễn phí. Điều này bao gồm các tệp được cấp phép theo "Giấy phép Creative Commons phi thương mại". Các tập tin như vậy được tải lên trước 2005-05-19 cũng có thể bị xóa nhanh chóng nếu không được sử dụng trong bất kỳ bài viết nào'
		},
		{
			label: 'TT4: Thiếu thông tin cấp phép',
			value: 'unksource',
			tooltip: 'Các tập tin trong danh mục "Thể loại:Tập tin có nguồn không xác định", "Tập tin có trạng thái bản quyền không xác định" hoặc "Tập tin không có thẻ bản quyền" đã được gắn thẻ bằng mẫu đặt chúng trong danh mục hơn "7 ngày", bất kể thời điểm tải lên. Lưu ý, thành viên đôi khi ghi rằng họ chính là người tạo ra tác phẩm, vì thế cần được xem xét kỹ lưỡng',
			hideWhenUser: true
		},
		{
			label: 'TT5: Tập tin không tự do nhưng không được sử dụng',
			value: 'tt5',
			tooltip: 'Các tập tin không theo giấy phép tự do hoặc trong phạm vi công cộng không được sử dụng trong bất kỳ bài viết nào, mà mục đích sử dụng duy nhất là trong một bài viết đã bị xóa và rất ít có khả năng được sử dụng trên bất kỳ bài viết nào khác. Các trường hợp ngoại lệ phù hợp có thể được thực hiện cho các tập tin được tải lên cho một bài viết sắp tới. Đối với các tập tin không tự do không được sử dụng khác, hãy sử dụng tùy chọn "Tập tin không tự do nhưng không được sử dụng" trong tab "DI" của Twinkle.',
			hideWhenUser: true
		},
		{
			label: 'TT6: Thiếu lý do sử dụng hợp lý với tập tin không tự do',
			value: 'norat',
			tooltip: 'Bất kỳ tập tin nào không có lý do sử dụng hợp lý có thể bị xóa sau "7 ngày" kể từ khi tải lên. Các bản mẫu biên bản sử dụng hợp pháp không tạo thành lý do hợp lệ về việc sử dụng hợp lý. Các tập tin được tải lên trước 2006-05-04 không nên bị xóa ngay lập tức; thay vào đó, người tải lên phải được thông báo rằng cần có lý do sử dụng hợp lý. Các tập tin được tải lên sau 2006-05-04 có thể được gắn thẻ bằng cách sử dụng tùy chọn "Thiếu lý do sử dụng hợp lý với tập tin không tự do" trong mô-đun "DI" của Twinkle. Các tập tin như vậy có thể được tìm thấy trong các thể loại con ngày tháng của Thể loại:Tập tin không có lý do sử dụng hợp pháp.',
			hideWhenUser: true
		},
		{
			label: 'TT7: Yêu cầu sử dụng hợp lý không hợp lệ',
			value: 'badfairuse',  // same as below
			tooltip: 'Tiêu chí này chỉ áp dụng cho các tập tin có thẻ sử dụng hợp pháp "rõ ràng không hợp lệ", chẳng hạn như thẻ {{Non-free logo}} trên ảnh chụp linh vật. Đối với các trường hợp cần thời gian chờ (hình ảnh có thể thay thế hoặc các lý do bị tranh chấp khác), hãy sử dụng các tùy chọn trên tab "DI" của Twinkle.',
			subgroup: {
				name: 'badfairuse_rationale',
				type: 'input',
				label: 'Lý do tùy chọn: ',
				size: 60
			}
		},
		{
			label: 'TT8: Các hình ảnh có sẵn dưới dạng các bản sao giống hệt nhau ở Wikimedia Commons',
			value: 'commons',
			tooltip: 'Đáp ứng các điều kiện sau: 1: Định dạng tập tin của cả hai hình ảnh đều giống nhau. 2: Giấy phép và trạng thái nguồn của tập tin vượt quá mức nghi ngờ hợp lý, và giấy phép chắc chắn được chấp nhận tại Commons. 3: Tất cả thông tin trên trang mô tả tập tin đều có trên trang mô tả tập tin Commons. Điều đó bao gồm toàn bộ lịch sử tải lên với các liên kết đến các trang thành viên (địa phương) của người tải lên. 4: Tập tin không được khóa và trang mô tả tập tin không có yêu cầu không chuyển nó đến Commons. 5: Nếu tập tin có sẵn trên Commons dưới một tên khác với tên địa phương, tất cả các tham chiếu địa phương đến tập tin phải được cập nhật để trỏ đến tiêu đề được sử dụng tại Commons. 6: Đối với các tập tin {{c-upload}}: có thể bị xóa nhanh chóng ngay khi bị gỡ bỏ khỏi Trang Chính',
			subgroup: {
				name: 'commons_filename',
				type: 'input',
				label: 'Tập tin ở Commons: ',
				value: Morebits.pageNameNorm,
				tooltip: 'Điều này có thể được để trống nếu tập tin có cùng tên trên Commons như ở đây. Tiền tố "File:" hay "Tập tin:" là tùy chọn.'
			},
			hideWhenMultiple: true
		},
		{
			label: 'TT9. Rõ ràng vi phạm bản quyền',
			value: 'imgcopyvio',
			tooltip: 'Tập tin được sao chép từ một trang web hoặc nguồn khác không có giấy phép tương thích với Wikipedia và người tải lên không tuyên bố sử dụng hợp pháp cũng không đưa ra lời khẳng định đáng tin cậy về việc cho phép sử dụng tự do. Các nguồn không có giấy phép tương thích với Wikipedia bao gồm các thư viện ảnh có sẵn như Getty Images hoặc Corbis. Các trường hợp không chắc là vi phạm bản quyền nên được thảo luận tại Wikipedia:Biểu quyết xoá tập tin',
			subgroup: [
				{
					name: 'imgcopyvio_url',
					type: 'input',
					label: 'URL vi phạm bản quyền, bao gồm "http://".  Nếu hình ảnh vi phạm không phải từ nguồn internet và bạn không thể cung cấp URL, bạn phải nêu lý do xóa. ',
					size: 60
				},
				{
					name: 'imgcopyvio_rationale',
					type: 'input',
					label: 'Lý do của việc xóa tập tin vi phạm không có mặt ở Internet: ',
					size: 60
				}
			]
		},
		{
			label: 'TT10. Tập tin không phải phương tiện và không hữu ích',
			value: 'badfiletype',
			tooltip: 'Các tập tin đã tải lên không phải là tập tin hình ảnh, âm thanh hoặc video (ví dụ: tập tin .doc, .pdf hoặc .xls) không được sử dụng trong bất kỳ bài viết nào và không có mục đích sử dụng bách khoa toàn thư'
		},
		{
			label: 'TT11: Không có bằng chứng về việc cho phép sử dụng',
			value: 'nopermission',
			tooltip: 'Nếu một người tải lên đã mô tả giấy phép và chỉ định bên thứ ba là người giữ nguồn/bản quyền mà không cung cấp bằng chứng cho thấy bên thứ ba này trên thực tế đã đồng ý, tập tin này có thể bị xóa sau 7 ngày sau khi thông báo cho người tải lên.',
			hideWhenUser: true
		}
	];
	
	Twinkle.speedy.articleList = [
		{
			label: 'BV1: Không ngữ cảnh hoặc thiếu ngữ cảnh cần thiết để người khác xác định đúng chủ thể được nói đến.',
			value: 'khongngucanh',
			tooltip: 'Tiêu chí này áp dụng cho các bài viết "thiếu ngữ cảnh cần thiết" để nhận diện chủ đề của bài viết.'
		},
		{
			label: 'BV2. Không có nội dung thực',
			value: 'khongnoidung',
			tooltip: 'Tiêu chí này áp dụng cho các bài viết chỉ chứa các liên kết ngoài, các nhãn thể loại hoặc các phần "Xem thêm", cách diễn đạt tiêu đề, các nỗ lực trao đổi thư tín với cá nhân hay nhóm được đặt tên theo tiêu đề bài viết, các câu hỏi đáng lẽ nên nằm ở bảng thông báo, các bình luận dạng trò chuyện, các nhãn bản mẫu, hoặc là các hình ảnh. Tiêu chí này không áp dụng các trang định hướng'
		},
		{
			label: 'BV3. Bài viết mới được tạo ra có nội dung sao chép từ một bài viết đã có sẵn',
			value: 'noidungsaochep',
			tooltip: 'Tiêu chí này áp dụng cho bất kỳ bài viết được tạo gần đây nào, dù không có lịch sử trang có liên quan nhưng trùng lặp nội dung với (các) bài viết hiện có và không mở rộng chi tiết hoặc cải thiện thông tin, và tiêu đề bài không phải là một trang đổi hướng. Tiêu chí này này không bao gồm việc chia tách các trang hoặc bất kỳ bài viết nào được mở rộng hoặc sắp xếp lại một bài hiện có hoặc chứa tài liệu tham chiếu, hợp nhất. Tiêu chí không bao gồm các trang định hướng.',
			subgroup: {
				name: 'baisaochep',
				type: 'input',
				label: 'Tên bài bị sao chép: ',
				tooltip: 'Tên bài bị sao chép nội dung.',
				size: 60
			},
		},
		{
			label: 'BV4. Bài viết rõ ràng chưa đủ độ nổi bật (cần xem xét thật kỹ trước khi gán nhãn)',
			value: 'khongnoibat',
			tooltip: 'Tiêu chí này áp dụng cho các bài viết có nội dung rõ ràng chưa đủ nổi bật. Tiêu chí này chỉ nên được sử dụng hạn chế và cẩn thận, sau khi đã trải qua các quá trình đánh giá bài viết kỹ lưỡng, bao gồm thẩm định nội dung bài viết, tìm kiếm/bổ sung nguồn tham khảo, đánh giá nguồn đáng tin cậy, đối chiếu các tiêu chí nổi bật theo quy định [[Wikipedia:Độ nổi bật]] và các quy định độ nổi bật con liên quan.'
		}
	];
	
	Twinkle.speedy.categoryList = [
		{
			label: 'TL1. Thể loại trống hoặc không cần thiết',
			value: 'theloaitrong',
			tooltip: 'Tiêu chí này áp dụng cho các thể loại trống hoặc không cần thiết. Đối với các thể loại bảo quản (ví dụ như [[Thể loại:Chờ xóa]]) thì phải đặt nhãn {{Thể loại trống}} để đánh dấu và các thể loại này không thuộc diện xóa nhanh.'
		},
		{
			label: 'TL2. Tên thể loại sai',
			value: 'theloaisaiten',
			tooltip: 'Tiêu chí này áp dụng với các [[Wikipedia:Thể loại|thể loại]] có tên sai, chẳng hạn như lỗi chính tả, lỗi bỏ dấu từ, lỗi trình bày... Lưu ý trong một số trường hợp, nếu tên thể loại viết sai nhưng phổ biến có thể giữ lại và đổi hướng đến thể loại đích có tên đúng. Đối với bài viết có tên sai, hãy xem xét tiêu chí [[Wikipedia:Tiêu chí xóa nhanh#C10|C10]]. Đối với các trang đổi hướng có tên sai, hãy xem xét tiêu chí [[Wikipedia:Tiêu chí xóa nhanh#ĐH4|ĐH4]].'
		}
	];
	
	Twinkle.speedy.userList = [
		{
			label: 'TV1. Thành viên yêu cầu xóa',
			value: 'tvyeucauxoa',
			tooltip: 'Thành viên có quyền được yêu cầu xóa các [[Wikipedia:Trang thành viên|trang thành viên]] và [[Wikipedia:Trang con|trang con]] của mình (nhưng không phải là [[WP:DELTALK|các trang thảo luận thành viên]]) theo yêu cầu cá nhân.',
			subgroup: mw.config.get('wgNamespaceNumber') === 3 && mw.config.get('wgTitle').indexOf('/') === -1 ? {
				name: 'userreq_rationale',
				type: 'input',
				label: 'Lý do bắt buộc để giải thích lý do tại sao nên xóa trang thảo luận của thành viên này: ',
				tooltip: 'Các trang thảo luận của thành viên chỉ bị xóa trong những trường hợp đặc biệt nghiêm trọng. Xem [[Wikipedia:Trang_thành_viên#Xóa_trang_thành_viên|Xóa trang thành viên]].',
				size: 60
			} : null,
			hideSubgroupWhenMultiple: true
		},
		{
			label: 'TV2. Tên thành viên chưa đăng ký',
			value: 'tvchuadangky',
			tooltip: 'Tiêu chí này áp dụng cho các trang thành viên chưa đăng ký/không tồn tại (kiểm tra tên thành viên tại [[Đặc biệt:Danh sách thành viên]]).'
		},
		{
			label: 'TV3. Chứa nhiều hình không tự do',
			value: 'tvhinhkhongtudo',
			tooltip: 'Tiêu chí này áp dụng cho [[Trợ giúp:Hình ảnh|các hình ảnh]] trong không gian thành viên, bao gồm hầu hết hoặc toàn bộ [[Wikipedia:Nội dung không tự do|hình ảnh không tự do hoặc "sử dụng hợp lý"]].',
			hideWhenRedirect: true
		}
	];
	
	Twinkle.speedy.templateList = [
		{
			label: 'BM1. Bản mẫu/Mô đun có nội dung hoặc cách trình bày vi phạm quy định của Wikipedia',
			value: 'banmauvipham',
			tooltip: 'Tiêu chí này áp dụng cho các bản mẫu/mô đun có nội dung hoặc cách trình bày vi phạm quy định của Wikipedia. Lưu ý các bản mẫu/mô đun quan trọng nhiều người xem hoặc được nhúng ở nhiều trang khác thì không thuộc diện xóa nhanh.'
		},
		{
			label: 'BM2. Bản mẫu/Mô đun không thể được sử dụng hữu ích theo bất kỳ cách nào hoặc theo biểu quyết đồng thuận',
			value: 'banmaukhonghuuich',
			tooltip: 'Tiêu chí này áp dụng cho các bản mẫu/mô đun không được sử dụng hữu ích. Bảo quản viên hoặc điều phối viên cần phải xem xét kỹ lưỡng bản mẫu/mô đun có thật sự hữu ích với Wikipedia hay không trước khi xóa nhanh. Lưu ý các bản mẫu/mô đun quan trọng nhiều người xem hoặc được nhúng ở nhiều trang khác thì không thuộc diện xóa nhanh. Nếu không thể xóa nhanh, bản mẫu/mô đun nên được đưa ra thảo luận tìm đồng thuận để quyết định xóa hay giữ. Tiêu chí này sẽ có hiệu lực nếu biểu quyết đồng thuận có kết quả là xóa. ',
			subgroup: {
				name: 'bieuquyet_url',
				type: 'input',
				label: 'Liên kết biểu quyết (nếu có): ',
				tooltip: 'Ghi liên kết URL của cuộc đồng thuận hay biểu quyết nếu có, bao gồm giao thức "http://" hoặc "https://".',
				size: 60
			}
		},
		{
			label: 'BM3. Bản mẫu/Mô đun không liên kết hoặc không sử dụng ở bất kỳ trang nào',
			value: 'banmaukhonglienket',
			tooltip: 'Tiêu chí này áp dụng cho các bản mẫu/mô đun không liên kết hoặc không sử dụng ở bất kỳ trang nào. Lưu ý các bản mẫu/mô đun quan trọng nhiều người xem hoặc được nhúng ở nhiều trang khác thì không thuộc diện xóa nhanh.'
		}
	];
	
	Twinkle.speedy.portalList = [
		{
			label: 'CTT1: Cổng thông tin dưới dạng một bài viết',
			value: 'ctt1',
			tooltip: 'Bạn phải chỉ định một tiêu chí bài viết áp dụng trong trường hợp này (các tiêu chí chung hoặc tiêu chí về bài viết).',
			subgroup: {
				name: 'p1_criterion',
				type: 'input',
				label: 'Tiêu chí bài viết sẽ áp dụng '
			}
		},
		{
			label: 'CTT2: Cổng thông tin ít thông tin (cấu thành từ ít hơn ba bài viết không sơ khai)',
			value: 'ctt2',
			tooltip: 'Bất kỳ Cổng thông tin nào dựa trên một chủ đề mà chỉ có một bài viết sơ khai và ít nhất ba bài viết không sơ khai nêu chi tiết về chủ đề thích hợp để thảo luận dưới tiêu đề của Cổng thông tin đó'
		}
	];
	
	Twinkle.speedy.generalList = [
		{
			label: 'C1. Vô nghĩa rõ ràng',
			value: 'nonsense',
			tooltip: 'Tiêu chí này áp dụng với những trang chứa các đoạn văn bản hoàn toàn không mạch lạc hoặc vô nghĩa, và cả nội dung lẫn lịch sử trang đều không chứa nội dung gì có ý nghĩa.',
			hideInNamespaces: [ 2 ] // Not applicable in userspace
		},
		{
			label: 'C2. Trang thử nghiệm',
			value: 'test',
			tooltip: 'Tiêu chí này áp dụng với những trang được tạo ra nhằm thử nghiệm chức năng sửa đổi hoặc những chức năng khác của Wikipedia. Tiêu chí cũng áp dụng với những trang con của [[Wikipedia:Chỗ thử|chỗ thử Wikipedia]] được tạo ra cho mục đích thử nghiệm, nhưng không áp dụng với chính trang <code>Chỗ thử:</code>.',
			hideInNamespaces: [ 2 ] // Not applicable in userspace
		},
		{
			label: 'C3. Hoàn toàn là phá hoại hoặc lừa bịp rõ ràng',
			value: 'vandalism',
			tooltip: 'Tiêu chí này áp dụng với những trang tung thông tin sai lệch, [[Wikipedia:Đừng tung tin vịt|tin vịt (thông tin lừa bịp)]] rõ ràng (kể cả những hình ảnh được tải lên nhằm cố ý cung cấp thông tin sai lệch), và các trang đổi hướng được tạo ra sau khi đổi tên những trang bị phá hoại tiêu đề về trang có tên đúng.'
		},
		{
			label: 'C4. Trang được tạo lại với nội dung của một trang đã từng bị xoá theo biểu quyết',
			value: 'repost',
			tooltip: 'Tiêu chí này áp dụng với những bản sao y hệt, dù đã được đổi sang tiêu đề mới, của một trang đã từng bị xoá theo kết quả của [[Wikipedia:Biểu quyết xóa bài|lần biểu quyết xoá]] gần đây nhất.',
			subgroup: {
				name: 'repost_xfd',
				type: 'input',
				label: 'Trang diễn ra cuộc thảo luận xóa:',
				tooltip: 'Phải bắt đầu với tiền tố "Wikipedia:"',
				size: 60
			}
		},
		{
			label: 'C5. Trang do thành viên bị cấm hoặc cấm chỉ tạo ra',
			value: 'banned',
			tooltip: 'Tiêu chí này áp dụng với những trang do [[:Thể loại:Thành viên Wikipedia bị cấm|các thành viên bị cấm]] tạo ra mà vi phạm [[Wikipedia:Quy định cấm thành viên|lệnh cấm]].',
			subgroup: {
				name: 'banneduser',
				type: 'input',
				label: 'Tên thành viên bị cấm (nếu có): ',
				tooltip: 'Không bắt đầu bằng tiền tố "User:" hoặc "Thành viên:"'
			}
		},
		{
			label: 'C6. Xóa để thực hiện các tác vụ bảo trì kĩ thuật',
			value: 'technical',
			tooltip: 'Tiêu chí này áp dụng với các tác vụ xóa để thực hiện công tác bảo trì kĩ thuật.'
		},
		{
			label: 'C7. Người viết/Tác giả yêu cầu xóa',
			value: 'author',
			tooltip: 'Tiêu chí này áp dụng trong trường hợp chính tác giả yêu cầu xóa (một cách có thiện chí) và đây phải là tác giả đóng góp nội dung chủ yếu của trang.',
			subgroup: {
				name: 'author_rationale',
				type: 'input',
				label: 'Lý do tùy chọn: ',
				tooltip: 'Liên kết đến nơi mà tác giả yêu cầu xóa.',
				size: 60
			},
			hideSubgroupWhenSysop: true
		},
		{
			label: 'C8. Trang liên quan đến một trang khác không tồn tại hoặc đã bị xóa',
			value: 'notexists',
			tooltip: 'Những trường hợp áp dụng tiêu chí này bao gồm [[Wikipedia:Trang thảo luận|trang thảo luận]] không có trang nội dung tương ứng, [[Wikipedia:Trang con|trang con]] nhưng không có trang cha mẹ bên ngoài, [[Trợ giúp:Trang tập tin|trang tập tin]] không chứa tập tin tương ứng, [[Wikipedia:Trnag đổi hướng|trang đổi hướng]] tới trang đích không hợp lệ, chẳng hạn như trang đích không tồn tại, trang đổi hướng bị lặp vòng, hoặc đổi hướng đến trang có tên nằm trong danh sách đen tiêu đề trang, [[Wikipedia:Thông báo sửa đổi|thông báo sửa đổi]] không sử dụng thuộc về những trang không tồn tại hoặc bị xoá và [[Wikipedia:Quy định khóa trang|khoá khả năng tạo mới]], và các thể loại được thêm tự động nhờ các bản mẫu đã bị xoá hoặc bị đổi hướng.',
			subgroup: {
				name: 'notexists_rationale',
				type: 'input',
				label: 'Lý do tùy chọn: ',
				size: 60
			},
			hideSubgroupWhenSysop: true
		},
		{
			label: 'C9. Quảng cáo, quảng bá cho một công ty, sản phẩm, dịch vụ hay cá nhân',
			value: 'advert',
			tooltip: 'Tiêu chí này áp dụng với những bài viết chỉ có một mục đích duy nhất là [[quảng cáo]] cho một công ty, sản phẩm, dịch vụ hay cá nhân và cần được viết lại nếu muốn đáp ứng yêu cầu bách khoa.'
		},
		{
			label: 'C10. Tên bài viết sai',
			value: 'wrongarticlename',
			tooltip: 'Tiêu chí này áp dụng với các bài viết có tên sai, chẳng hạn như lỗi chính tả, lỗi bỏ dấu từ, lỗi trình bày... Lưu ý trong một số trường hợp, nếu tên bài viết sai nhưng phổ biến thì có thể giữ lại và đổi hướng đến trang đích có tên đúng. Đối với các trang đổi hướng có tên sai, hãy xem xét tiêu chí [[Wikipedia:Tiêu chí xóa nhanh#ĐH4|ĐH4]].'
		},
		{
			label: 'C11. Bài viết có nội dung tấn công cá nhân',
			value: 'attack',
			tooltip: 'Các ví dụ của các "[[Wikipedia:Trang tấn công|trang có nội dung tấn công]]" có thể bao gồm [[Wikipedia:Bôi nhọ|phỉ báng]], [[Wikipedia:Không đe dọa can thiệp pháp lý|đe dọa pháp lý]], thông tin hoàn toàn với ý định [[Wikipedia:Quấy rối|quấy rối hoặc đe dọa]] một cá nhân hay [[Wikipedia:Tiểu sử người đang sống|tiểu sử người đang sống]], có giọng điệu hoàn toàn tiêu cực và không có nguồn gốc. Những trang này nên được xóa nhanh khi không có bất cứ phiên bản sửa đổi trang nào thể hiện [[Wikipedia:Thái độ trung lập|thái độ trung lập]] để lùi sửa.'
		},
		{
			label: 'C12. Bài không được dịch: chỉ có ≤ 10 từ tiếng Việt, còn lại là tiếng nước ngoài',
			value: 'foreign',
			tooltip: 'Tiêu chí này áp dụng cho các bài viết không được viết bằng tiếng Việt hoặc có ít hơn 10 chữ là từ tiếng Việt và về cơ bản nội dung có thể giống như một bài viết ở một dự án Wikimedia khác. Nếu bài viết không giống như một bài viết ở một dự án khác, hãy sử dụng mẫu {{tlx|Không có tiếng Việt}} để thay thế và liệt kê trang tại [[Wikipedia:Các trang cần dịch sang tiếng Việt]] để xem xét và có thể dịch.'
		},
		{
			label: 'C13. Bài/đoạn hoặc hình ảnh vi phạm bản quyền',
			value: 'copyvio',
			tooltip: 'Tiêu chí này áp dụng cho các trang văn bản chứa tài liệu bản quyền mà không có khẳng định tin cậy để sử dụng ở miền công cộng, cơ sở sử dụng hợp pháp hoặc [[Wikipedia:Giấy phép tương thích|giấy phép tự do có tính tương thích]], và không có nội dung không vi phạm nào đáng được lưu trữ lại.',
			subgroup: [
				{
					name: 'copyvio_url',
					type: 'input',
					label: 'URL (nếu có): ',
					tooltip: 'Nếu được sao chép từ một nguồn trực tuyến, hãy đặt URL ở đây, bao gồm giao thức "http://" hoặc "https://".',
					size: 60
				},
				{
					name: 'copyvio_url2',
					type: 'input',
					label: 'URL bổ sung 1: ',
					tooltip: 'Không bắt buộc. Nên bắt đầu với "http://" hoặc "https://"',
					size: 60
				},
				{
					name: 'copyvio_url3',
					type: 'input',
					label: 'URL bổ sung 2: ',
					tooltip: 'Không bắt buộc. Nên bắt đầu với "http://" hoặc "https://"',
					size: 60
				}
			]
		}
	];
	
	Twinkle.speedy.redirectList = [
		{
			label: 'ĐH1. Trang đổi hướng đến một trang không tồn tại',
			value: 'doihuongkhongtontai',
			tooltip: 'Tiêu chí này áp dụng cho bất kỳ trang đổi hướng nào đến trang không tồn tại. Khi xóa một trang, quản trị viên lưu ý kiểm tra và xóa tất cả các trang đổi hướng đến trang vừa xóa nếu có. Các trang đổi hướng đến trang không tồn tại được lưu trữ ở [[Đặc biệt:Đổi hướng sai]].'
		},
		{
			label: 'ĐH2. Trang đổi hướng lặp',
			value: 'doihuonglap',
			tooltip: 'Tiêu chí này áp dụng cho tất cả các trang đổi hướng lặp hay đổi hướng đến chính nó. Các trang đổi hướng lặp, có thể xuất hiện do lỗi của biên tập viên hoặc bot, không có bất kỳ ý nghĩa đổi hướng nào và cần phải được xóa nhanh.'
		},
		{
			label: 'ĐH3. Đổi hướng liên không gian',
			value: 'doihuonglienkhonggian',
			tooltip: 'Tiêu chí này áp dụng cho các trang đổi hướng (trừ các trang [[Wikipedia:Viết tắt|viết tắt]]) từ [[Wikipedia:Không gian chính|không gian chính]] (không gian bài viết) đến bất kỳ không gian nào, ngoại trừ các không gian sau Thể loại:, Bản mẫu:, Wikipedia:, Giúp đỡ: và Chủ đề:.'
		},
		{
			label: 'ĐH4. Tên trang đổi hướng sai',
			value: 'doihuongsai',
			tooltip: 'Tiêu chí này áp dụng với các [[Wikipedia:Trang đổi hướng|trang đổi hướng]] có tên sai, chẳng hạn như lỗi chính tả, lỗi bỏ dấu từ, lỗi trình bày...'
		}
	];
	
	Twinkle.speedy.normalizeHash = {
		'reason': 'db',
		'nonsense': 'c1',
		'test': 'c2',
		'vandalism': 'c3',
		'repost': 'c4',
		'banned': 'c5',
		'technical': 'c6',
		'author': 'c7',
		'notexists': 'c8',
		'talk': 'c8',
		'advert': 'c9',
		'wrongarticlename': 'c10',
		'attack': 'c11',
		'foreign': 'c12',
		'copyvio': 'c13',
		'khongngucanh': 'bv1',
		'khongnoidung': 'bv2',
		'noidungsaochep': 'bv3',
		'khongnoibat': 'bv4',
		'doihuongkhongtontai': 'đh1',
		'doihuonglap': 'đh2',
		'doihuonglienkhonggian': 'đh3',
		'doihuongsai': 'đh4',
		'banmauvipham': 'bm1',
		'banmaukhonghuuich': 'bm2',
		'banmaukhonglienket': 'bm3',
		'theloaitrong': 'tl1',
		'theloaisaiten': 'tl2',
		'tvyeucauxoa': 'tv1',
		'tvchuadangky': 'tv2',
		'tvhinhkhongtudo': 'tv3',
		'ctt1': 'ctt1',
		'ctt2': 'ctt2',
		'redundantimage': 'tt1',
		'noimage': 'tt2',
		'fpcfail': 'tt2',
		'noncom': 'tt3',
		'unksource': 'tt4',
		'unfree': 'tt5',
		'f5': 'tt5',
		'norat': 'tt6',
		'badfairuse': 'tt7',
		'commons': 'tt8',
		'imgcopyvio': 'tt9',
		'badfiletype': 'tt10',
		'nopermission': 'tt11',
	};
	
	Twinkle.speedy.callbacks = {
		getTemplateCodeAndParams: function(params) {
			var code, parameters, i;
			if (params.normalizeds.length > 1) {
				code = '{{db-multiple';
				params.utparams = {};
				$.each(params.normalizeds, function(index, norm) {
					code += '|' + norm.toUpperCase();
					parameters = params.templateParams[index] || [];
					for (var i in parameters) {
						if (typeof parameters[i] === 'string' && !parseInt(i, 10)) {  // skip numeric parameters - {{db-multiple}} doesn't understand them
							code += '|' + i + '=' + parameters[i];
						}
					}
					$.extend(params.utparams, Twinkle.speedy.getUserTalkParameters(norm, parameters));
				});
				code += '}}';
			} else {
				parameters = params.templateParams[0] || [];
				code = '{{db-' + params.values[0];
				for (i in parameters) {
					if (typeof parameters[i] === 'string') {
						code += '|' + i + '=' + parameters[i];
					}
				}
				if (params.usertalk) {
					code += '|help=off';
				}
				code += '}}';
				params.utparams = Twinkle.speedy.getUserTalkParameters(params.normalizeds[0], parameters);
			}
	
			return [code, params.utparams];
		},
	
		parseWikitext: function(wikitext, callback) {
			var query = {
				action: 'parse',
				prop: 'text',
				pst: 'true',
				text: wikitext,
				contentmodel: 'wikitext',
				title: mw.config.get('wgPageName')
			};
	
			var statusIndicator = new Morebits.status('Đang xây dựng tóm tắt xóa');
			var api = new Morebits.wiki.api('Đang phân tích cú pháp bản mẫu xóa', query, function(apiObj) {
				var reason = decodeURIComponent($(apiObj.getXML().querySelector('text').childNodes[0].nodeValue).find('#delete-reason').text()).replace(/\+/g, ' ');
				if (!reason) {
					statusIndicator.warn('Không thể tạo tóm tắt từ bản mẫu xóa');
				} else {
					statusIndicator.info('hoàn tất');
				}
				callback(reason);
			}, statusIndicator);
			api.post();
		},
	
		noteToCreator: function(pageobj) {
			var params = pageobj.getCallbackParameters();
			var initialContrib = pageobj.getCreator();
	
			// disallow notifying yourself
			if (initialContrib === mw.config.get('wgUserName')) {
				Morebits.status.warn('Bạn (' + initialContrib + ') đã tạo trang này; đang bỏ qua thông báo thành viên');
				initialContrib = null;
	
			// không thông báo cho thành viên khi trang thảo luận của thành viên của họ được đề cử/xóa
			} else if (initialContrib === mw.config.get('wgTitle') && mw.config.get('wgNamespaceNumber') === 3) {
				Morebits.status.warn('Đang thông báo cho người đóng góp ban đầu: thành viên này đã tạo trang thảo luận thành viên của riêng mình; bỏ qua thông báo');
				initialContrib = null;
	
			// Chưa có bot làm việc này nên ẩn tạm...
			// } else if ((initialContrib === 'Cyberbot I' || initialContrib === 'SoxBot') && params.normalizeds[0] === 'tt2') {
			//     Morebits.status.warn('Thông báo cho người đóng góp ban đầu: trang được tạo bởi bot; bỏ qua thông báo');
			//     initialContrib = null;
	
			// Check for already existing tags
			} else if (Twinkle.speedy.hasCSD && params.warnUser && !confirm('Trang đã chứa một thẻ xóa nhanh và do đó, người tạo có thể đã được thông báo việc xóa trang. Bạn có muốn thông báo cho họ về việc xóa trang này không?')) {
				Morebits.status.info('Đang thông báo cho người đóng góp ban đầu', 'bị hủy bởi thành viên; bỏ qua thông báo.');
			
			// Check for banned users, thanh viên bị cấm cho nên không cần thông báo
			} else if (params.normalizeds[0] === 'c5') {
				Morebits.status.warn('Thông báo cho người đóng góp ban đầu: thành viên bị cấm; bỏ qua thông báo');
				initialContrib = null;
			}
	
			if (initialContrib) {
				var usertalkpage = new Morebits.wiki.page('Thảo luận thành viên:' + initialContrib, 'Đang thông báo cho người đóng góp ban đầu (' + initialContrib + ')'),
					notifytext, i, editsummary;
	
				// special cases: "db" and "db-multiple"
				if (params.normalizeds.length > 1) {
					notifytext = '\n{{subst:db-' + (params.warnUser ? 'deleted' : 'notice') + '-multiple|1=' + Morebits.pageNameNorm;
					var count = 2;
					$.each(params.normalizeds, function(index, norm) {
						notifytext += '|' + count++ + '=' + norm.toUpperCase();
					});
				} else if (params.normalizeds[0] === 'db') {
					notifytext = '\n{{subst:db-reason-' + (params.warnUser ? 'deleted' : 'notice') + '|1=' + Morebits.pageNameNorm;
				} else {
					notifytext = '\n{{subst:db-csd-' + (params.warnUser ? 'deleted' : 'notice') + '-custom|1=';
					if (params.values[0] === 'copypaste') {
						notifytext += params.templateParams[0].sourcepage;
					} else {
						notifytext += Morebits.pageNameNorm;
					}
					notifytext += '|2=' + params.values[0];
				}
	
				for (i in params.utparams) {
					if (typeof params.utparams[i] === 'string') {
						notifytext += '|' + i + '=' + params.utparams[i];
					}
				}
				notifytext += (params.welcomeuser ? '' : '|nowelcome=yes') + '}} ~~~~';
	
				editsummary = 'Thông báo:' + (params.warnUser ? '' : ' Có đề nghị ') + ' [[WP:XN|xóa nhanh]] ';
				
				if (params.normalizeds.indexOf('c11') === -1) {  // không có tên bài viết nào trong tóm tắt cho các thẻ C11
					editsummary += ' [[:' + Morebits.pageNameNorm + ']].';
				} else {
					editsummary += ' một trang tấn công.';
				}
	
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary(editsummary);
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				usertalkpage.setFollowRedirect(true, false);
				usertalkpage.append(function onNotifySuccess() {
					// add this nomination to the user's userspace log, if the user has enabled it
					if (params.lognomination) {
						Twinkle.speedy.callbacks.user.addToLog(params, initialContrib);
					}
				}, function onNotifyError() {
					// if user could not be notified, log nomination without mentioning that notification was sent
					if (params.lognomination) {
						Twinkle.speedy.callbacks.user.addToLog(params, null);
					}
				});
			} else if (params.lognomination) {
				// log nomination even if the user notification wasn't sent
				Twinkle.speedy.callbacks.user.addToLog(params, null);
			}
		},
	
		sysop: {
			main: function(params) {
				var reason;
				if (!params.normalizeds.length && params.normalizeds[0] === 'db') {
					reason = prompt('Nhập lý do xóa, lý do này sẽ được nhập vào nhật trình xóa nhanh:', '');
					Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
				} else {
					var code = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params)[0];
					Twinkle.speedy.callbacks.parseWikitext(code, function(reason) {
						if (params.promptForSummary) {
							reason = prompt('Nhập lý do xóa để sử dụng hoặc nhấn OK để chấp nhận bản lý do được tạo tự động.', reason);
						}
						Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
					});
				}
			},
			deletePage: function(reason, params) {
				var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Đang xóa trang');
	
				if (reason === null) {
					return Morebits.status.error('Asking for reason', 'User cancelled');
				} else if (!reason || !reason.replace(/^\s*/, '').replace(/\s*$/, '')) {
					return Morebits.status.error('Đang yêu cầu lý do', "bạn đã không đưa ra một lý do xóa nhanh, tác vụ đã bị hủy bỏ.");
				}
	
				var deleteMain = function(callback) {
					thispage.setEditSummary(reason);
					thispage.setChangeTags(Twinkle.changeTags);
					thispage.setWatchlist(params.watch);
					thispage.deletePage(function() {
						thispage.getStatusElement().info('đã xong');
						typeof callback === 'function' && callback();
						Twinkle.speedy.callbacks.sysop.deleteTalk(params);
					});
				};
	
				// look up initial contributor. If prompting user for deletion reason, just display a link.
				// Otherwise open the talk page directly
				if (params.warnUser) {
					thispage.setCallbackParameters(params);
					thispage.lookupCreation(function(pageobj) {
						deleteMain(function() {
							Twinkle.speedy.callbacks.noteToCreator(pageobj);
						});
					});
				} else {
					deleteMain();
				}
			},
			deleteTalk: function(params) {
				// delete talk page
				if (params.deleteTalkPage &&
						params.normalized !== 'tt8' &&
						document.getElementById('ca-talk').className !== 'new') {
					var talkpage = new Morebits.wiki.page(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceNumber') + 1] + ':' + mw.config.get('wgTitle'), 'Đang xóa trang thảo luận');
					talkpage.setEditSummary('[[WP:C8|C8]]: Trang thảo luận của một trang đã bị xóa "' + Morebits.pageNameNorm + '"');
					talkpage.setChangeTags(Twinkle.changeTags);
					talkpage.deletePage();
					// this is ugly, but because of the architecture of wiki.api, it is needed
					// (otherwise success/failure messages for the previous action would be suppressed)
					window.setTimeout(function() {
						Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
					}, 1800);
				} else {
					Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
				}
			},
			deleteRedirects: function(params) {
				// delete redirects
				if (params.deleteRedirects) {
					var query = {
						'action': 'query',
						'titles': mw.config.get('wgPageName'),
						'prop': 'redirects',
						'rdlimit': 'max' // 500 is max for normal users, 5000 for bots and sysops
					};
					var wikipedia_api = new Morebits.wiki.api('đang lấy danh sách các trang đổi hướng...', query, Twinkle.speedy.callbacks.sysop.deleteRedirectsMain,
						new Morebits.status('Đang xóa các trang đổi hướng'));
					wikipedia_api.params = params;
					wikipedia_api.post();
				}
	
				// promote Unlink tool
				var $link, $bigtext;
				if (mw.config.get('wgNamespaceNumber') === 6 && params.normalized !== 'tt8') {
					$link = $('<a/>', {
						'href': '#',
						'text': 'nhấp vào đây để sử dụng công cụ Gỡ liên kết',
						'css': { 'fontSize': '130%', 'fontWeight': 'bold' },
						'click': function() {
							Morebits.wiki.actionCompleted.redirect = null;
							Twinkle.speedy.dialog.close();
							Twinkle.unlink.callback('Đang gỡ liên kết đến tập tin đã xóa ' + Morebits.pageNameNorm);
						}
					});
					$bigtext = $('<span/>', {
						'text': 'Để gỡ các backlink và xóa liên kết sử dụng tập tin',
						'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
					});
					Morebits.status.info($bigtext[0], $link[0]);
				} else if (params.normalized !== 'tt8') {
					$link = $('<a/>', {
						'href': '#',
						'text': 'nhấp vào đây để chuyển đến công cụ Gỡ liên kết',
						'css': { 'fontSize': '130%', 'fontWeight': 'bold' },
						'click': function() {
							Morebits.wiki.actionCompleted.redirect = null;
							Twinkle.speedy.dialog.close();
							Twinkle.unlink.callback('Đang xóa các liên kết đến trang đã xóa ' + Morebits.pageNameNorm);
						}
					});
					$bigtext = $('<span/>', {
						'text': 'Để gỡ các backlink',
						'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
					});
					Morebits.status.info($bigtext[0], $link[0]);
				}
			},
			deleteRedirectsMain: function(apiobj) {
				var xmlDoc = apiobj.getXML();
				var $snapshot = $(xmlDoc).find('redirects rd');
				var total = $snapshot.length;
				var statusIndicator = apiobj.statelem;
	
				if (!total) {
					statusIndicator.status('không tìm thấy trang đổi hướng nào');
					return;
				}
	
				statusIndicator.status('0%');
	
				var current = 0;
				var onsuccess = function(apiobjInner) {
					var now = parseInt(100 * ++current / total, 10) + '%';
					statusIndicator.update(now);
					apiobjInner.statelem.unlink();
					if (current >= total) {
						statusIndicator.info(now + ' (đã hoàn tất)');
						Morebits.wiki.removeCheckpoint();
					}
				};
	
				Morebits.wiki.addCheckpoint();
	
				$snapshot.each(function(key, value) {
					var title = $(value).attr('title');
					var page = new Morebits.wiki.page(title, 'Đang xóa trang đổi hướng "' + title + '"');
					page.setEditSummary('[[WP:TCXB#ĐH1|ĐH1]]: Trang đổi hướng đến trang đã bị xóa "' + Morebits.pageNameNorm + '"');
					page.setChangeTags(Twinkle.changeTags);
					page.deletePage(onsuccess);
				});
			}
		},
	
		user: {
			main: function(pageobj) {
				var statelem = pageobj.getStatusElement();
	
				if (!pageobj.exists()) {
					statelem.error("Có vẻ như trang không tồn tại hoặc có thể đã bị xóa");
					return;
				}
	
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
	
				statelem.status('Đang kiểm tra các thẻ trên trang...');
	
				// check for existing deletion tags
				var tag = /(?:\{\{\s*(db|delete|db-.*?|speedy deletion-.*?)(?:\s*\||\s*\}\}))/.exec(text);
				// This won't make use of the db-multiple template but it probably should
				if (tag && !confirm('Trang đã chứa bản mẫu xóa nhanh (CSD) {{' + tag[1] + '}}. Bạn có muốn thêm một bản mẫu xóa nhanh khác không?')) {
					return;
				}
	
				var xfd = /\{\{((?:article for deletion|proposed deletion|prod blp|afd|template for discussion)\/dated|[cfm]fd\b)/i.exec(text) || /#invoke:(RfD)/.exec(text);
				if (xfd && !confirm('Một bản mẫu xóa {{' + xfd[1] + '}} đã được tìm thấy trên trang. Bạn có muốn tiếp tục thêm một bản mẫu CSD?')) {
					return;
				}
	
				// given the params, builds the template and also adds the user talk page parameters to the params that were passed in
				// returns => [<string> wikitext, <object> utparams]
				var buildData = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params),
					code = buildData[0];
				params.utparams = buildData[1];
	
				// curate/patrol the page -- đang bị lỗi hàm triage()
				/*if (Twinkle.getPref('markSpeedyPagesAsPatrolled')) {
					statelem.status('Twinkle bị lỗi, vui lòng gán nhãn bằng tay. Alphama đang sửa lỗi này!');
					pageobj.triage();
				}*/
	
				// Wrap SD template in noinclude tags if we are in template space.
				// Won't work with userboxes in userspace, or any other transcluded page outside template space
				if (mw.config.get('wgNamespaceNumber') === 10) {  // Template:
					code = '<noinclude>' + code + '</noinclude>';
				}
	
				// Remove tags that become superfluous with this action
				text = text.replace(/\{\{\s*([Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
				if (mw.config.get('wgNamespaceNumber') === 6) {
					// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
					text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');
				}
	
				if (params.requestsalt) {
					if (params.normalizeds.indexOf('c11') === -1) {
						code = code + '\n{{salt}}';
					} else {
						code = '{{salt}}\n' + code;
					}
				}
	
				// Scribunto isn't parsed like wikitext, so CSD templates on modules need special handling to work
				if (mw.config.get('wgPageContentModel') === 'Scribunto') {
					var equals = '';
					while (code.indexOf(']' + equals + ']') !== -1) {
						equals += '=';
					}
					code = "require('Module:Module wikitext')._addText([" + equals + '[' + code + ']' + equals + ']);';
				}
	
				// Generate edit summary for edit
				var editsummary;
				if (params.normalizeds.length > 1) {
					editsummary = 'Đang yêu cầu xóa nhanh (';
					$.each(params.normalizeds, function(index, norm) {
						editsummary += '[[WP:TCXN#' + norm.toUpperCase() + '|TCXN ' + norm.toUpperCase() + ']], ';
					});
					editsummary = editsummary.substr(0, editsummary.length - 2); // remove trailing comma
					editsummary += ').';
				} else if (params.normalizeds[0] === 'db') {
					editsummary = 'Đang yêu cầu [[Wikipedia:Tiêu chí xóa nhanh|xóa nhanh]] với lý do "' + params.templateParams[0]['1'] + '".';
				} else {
					editsummary = 'Đang yêu cầu xóa nhanh ([[WP:TCXN#' + params.normalizeds[0].toUpperCase() + '|TCXN ' + params.normalizeds[0].toUpperCase() + ']]).';
				}
	
				// Set the correct value for |ts= parameter in {{db-g13}} -- viwiki không có tiêu chí này
				/*if (params.normalizeds.indexOf('g13') !== -1) {
					code = code.replace('$TIMESTAMP', pageobj.getLastEditTime());
				}*/
	
	
				// Blank attack pages
				if (params.normalizeds.indexOf('c3') !== -1) {
					text = code;
				} else {
					// Insert tag after short description or any hatnotes
					var wikipage = new Morebits.wikitext.page(text);
					text = wikipage.insertAfterTemplates(code + '\n', Twinkle.hatnoteRegex).getText();
				}
	
	
				pageobj.setPageText(text);
				pageobj.setEditSummary(editsummary);
				pageobj.setWatchlist(params.watch);
				pageobj.save(Twinkle.speedy.callbacks.user.tagComplete);
			},
	
			tagComplete: function(pageobj) {
				var params = pageobj.getCallbackParameters();
	
				// Notification to first contributor, will also log nomination to the user's userspace log
				if (params.usertalk) {
					var thispage = new Morebits.wiki.page(Morebits.pageNameNorm);
					thispage.setCallbackParameters(params);
					thispage.lookupCreation(Twinkle.speedy.callbacks.noteToCreator);
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else if (params.lognomination) {
					Twinkle.speedy.callbacks.user.addToLog(params, null);
				}
			},
	
			// note: this code is also invoked from twinkleimage
			// the params used are:
			//   for CSD: params.values, params.normalizeds  (note: normalizeds is an array)
			//   for DI: params.fromDI = true, params.templatename, params.normalized  (note: normalized is a string)
			addToLog: function(params, initialContrib) {
				var usl = new Morebits.userspaceLogger(Twinkle.getPref('speedyLogPageName'));
				usl.initialText =
					"Đây là nhật trình của tất cả đề nghị [[Wikipedia:Tiêu chí xóa nhanh|xóa nhanh]] được thực hiện bởi thành viên này bằng cách sử dụng mô đun CSD của [[WP:TW|Twinkle]].\n\n" +
					'Nếu bạn không muốn giữ nhật trình này nữa, bạn có thể tắt nó bằng cách sử dụng [[Wikipedia:Twinkle/Preferences|bảng cài đặt Twinkle]], và ' +
					'đề cử trang này để xóa nhanh chóng dưới dạng [[WP:TV1|TCXN TV1]].' +
					(Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? '\n\nChú ý: Nhật trình này không theo dõi các thao tác xóa nhanh ngay lập tức được thực hiện bằng Twinkle.' : '');
	
				var formatParamLog = function(normalize, csdparam, input) {
					if ((normalize === 'C4' && csdparam === 'xfd') ||
						(normalize === 'C6' && csdparam === 'page') ||
						(normalize === 'C6' && csdparam === 'fullvotepage') ||
						(normalize === 'C6' && csdparam === 'sourcepage') ||
						(normalize === 'C12' && csdparam === 'source') ||
						(normalize === 'BV3' && csdparam === 'article') ||
						(normalize === 'TT1' && csdparam === 'filename') ||
						(normalize === 'TT5' && csdparam === 'replacement')) {
						input = '[[:' + input + ']]';
					} else if (normalize === 'G5' && csdparam === 'user') {
						input = '[[:Thành viên:' + input + ']]';
					} else if (normalize === 'C13' && csdparam.lastIndexOf('url', 0) === 0 && input.lastIndexOf('http', 0) === 0) {
						input = '[' + input + ' ' + input + ']';
					} else if (normalize === 'BM2' && csdparam === 'template') {
						input = '[[:Bản mẫu:' + input + ']]';
					} else if (normalize === 'TT8' && csdparam === 'filename') {
						input = '[[:commons:' + input + ']]';
					} else if (normalize === 'CTT1' && csdparam === 'criterion') {
						input = '[[WP:CSD#' + input + ']]';
					}
					return ' {' + normalize + ' ' + csdparam + ': ' + input + '}';
				};
	
				var extraInfo = '';
	
				// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
				var fileLogLink = mw.config.get('wgNamespaceNumber') === 6 ? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} nhật trình])' : '';
	
				var editsummary = 'Đang ghi nhật trình đề nghị xóa nhanh';
				var appendText = '# [[:' + Morebits.pageNameNorm;
	
				if (params.fromDI) {
					appendText += ']]' + fileLogLink + ': DI [[WP:TCXN#' + params.normalized.toUpperCase() + '|TCXN ' + params.normalized.toUpperCase() + ']] ({{tl|di-' + params.templatename + '}})';
					// The params data structure when coming from DI is quite different,
					// so this hardcodes the only interesting items worth logging
					['reason', 'replacement', 'source'].forEach(function(item) {
						if (params[item]) {
							extraInfo += formatParamLog(params.normalized.toUpperCase(), item, params[item]);
							return false;
						}
					});
					editsummary += ' [[:' + Morebits.pageNameNorm + ']].';
				} else {
					if (params.normalizeds.indexOf('c11') === -1) {  // no article name in log for C10 taggings
						appendText += ']]' + fileLogLink + ': ';
						editsummary += ' [[:' + Morebits.pageNameNorm + ']].';
					} else {
						appendText += '|Trang]] tấn công này' + fileLogLink + ': ';
						editsummary += ' một trang tấn công.';
					}
					if (params.normalizeds.length > 1) {
						appendText += 'nhiều tiêu chí (';
						$.each(params.normalizeds, function(index, norm) {
							appendText += '[[WP:TCXN#' + norm.toUpperCase() + '|' + norm.toUpperCase() + ']], ';
						});
						appendText = appendText.substr(0, appendText.length - 2);  // remove trailing comma
						appendText += ')';
					} else if (params.normalizeds[0] === 'db') {
						appendText += '{{tl|db-reason}}';
					} else {
						appendText += '[[WP:TCXN#' + params.normalizeds[0].toUpperCase() + '|TCXN ' + params.normalizeds[0].toUpperCase() + ']] ({{tl|db-' + params.values[0] + '}})';
					}
	
					// If params is "empty" it will still be full of empty arrays, but ask anyway
					if (params.templateParams) {
						// Treat custom rationale individually
						if (params.normalizeds[0] && params.normalizeds[0] === 'db') {
							extraInfo += formatParamLog('Custom', 'rationale', params.templateParams[0]['1']);
						} else {
							params.templateParams.forEach(function(item, index) {
								var keys = Object.keys(item);
								if (keys[0] !== undefined && keys[0].length > 0) {
									// Second loop required since some items (G12, F9) may have multiple keys
									keys.forEach(function(key, keyIndex) {
										if (keys[keyIndex] === 'blanked' || keys[keyIndex] === 'ts') {
											return true; // Not worth logging
										}
										extraInfo += formatParamLog(params.normalizeds[index].toUpperCase(), keys[keyIndex], item[key]);
									});
								}
							});
						}
					}
				}
	
				if (params.requestsalt) {
					appendText += '; đã yêu cầu ([[WP:SALT|khóa khả năng tạo trang]])';
				}
				if (extraInfo) {
					appendText += '; thông tin bổ sung:' + extraInfo;
				}
				if (initialContrib) {
					appendText += '; đã thông báo {{user|1=' + initialContrib + '}}';
				}
				appendText += ' ~~~~~\n';
	
				usl.changeTags = Twinkle.changeTags;
				usl.log(appendText, editsummary);
			}
		}
	};
	
	// validate subgroups in the form passed into the speedy deletion tag
	Twinkle.speedy.getParameters = function twinklespeedyGetParameters(form, values) {
		var parameters = [];
	
		$.each(values, function(index, value) {
			var currentParams = [];
			switch (value) {
				case 'reason':
					if (form['csd.reason_1']) {
						var dbrationale = form['csd.reason_1'].value;
						if (!dbrationale || !dbrationale.trim()) {
							alert('Lý do tùy chọn:  Vui lòng nêu ra một lý do.');
							parameters = null;
							return false;
						}
						currentParams['1'] = dbrationale;
					}
					break;
	
				case 'tvyeucauxoa':  // U1
					if (form['csd.userreq_rationale']) {
						var u1rationale = form['csd.userreq_rationale'].value;
						if (mw.config.get('wgNamespaceNumber') === 3 && !(/\//).test(mw.config.get('wgTitle')) &&
								(!u1rationale || !u1rationale.trim())) {
							alert('TCXN U1: Vui lòng đưa ra lý do khi đề nghị xóa các trang thảo luận của thành viên.');
							parameters = null;
							return false;
						}
						currentParams.rationale = u1rationale;
					}
					break;
	
				case 'repost':  // C4
					if (form['csd.repost_xfd']) {
						var deldisc = form['csd.repost_xfd'].value;
						if (deldisc) {
							if (!/^(?:wp|wikipedia):/i.test(deldisc)) {
								alert('TCXN C4: Tên trang biểu quyết xóa, nếu nhập vào thì phải bắt đầu bằng tiền tố "Wikipedia:".');
								parameters = null;
								return false;
							}
							currentParams.xfd = deldisc;
						}
					}
					break;
	
				case 'banned':  // C5
					if (form['csd.banned'] && form['csd.v'].value) {
						currentParams.user = form['csd.banned'].value.replace(/^\s*User:/i, '');
					}
					break;
	
				case 'move':  // C6
					if (form['csd.move_page'] && form['csd.move_reason']) {
						var movepage = form['csd.move_page'].value,
							movereason = form['csd.move_reason'].value;
						if (!movepage || !movepage.trim()) {
							alert('TCXN C6 (di chuyển): Xin vui lòng nêu rõ trang cần được di chuyển đến đây.');
							parameters = null;
							return false;
						}
						if (!movereason || !movereason.trim()) {
							alert('TCXN C6 (di chuyển): Vui lòng nhập lý do.');
							parameters = null;
							return false;
						}
						currentParams.page = movepage;
						currentParams.reason = movereason;
					}
					break;
	
				case 'xfd':  // C6
					if (form['csd.xfd_fullvotepage']) {
						var xfd = form['csd.xfd_fullvotepage'].value;
						if (xfd) {
							if (!/^(?:wp|wikipedia):/i.test(xfd)) {
								alert('TCXN C6 (BQXB): Trang biểu quyết xóa bài, bắt đầu bằng tiền tố "Wikipedia:".');
								parameters = null;
								return false;
							}
							currentParams.fullvotepage = xfd;
						}
					}
					break;
	
				case 'copypaste':  // C6
					if (form['csd.copypaste_sourcepage']) {
						var copypaste = form['csd.copypaste_sourcepage'].value;
						if (!copypaste || !copypaste.trim()) {
							alert('TCXN C6 (chép dán): Xin vui lòng nhập trang gốc.');
							parameters = null;
							return false;
						}
						currentParams.sourcepage = copypaste;
					}
					break;
	
				case 'g6':  // C6
					if (form['csd.c6_rationale'] && form['csd.c6_rationale'].value) {
						currentParams.rationale = form['csd.c6_rationale'].value;
					}
					break;
	
				case 'author':  // C7
					if (form['csd.author_rationale'] && form['csd.author_rationale'].value) {
						currentParams.rationale = form['csd.author_rationale'].value;
					}
					break;
	
				case 'notexists':  // C8
					if (form['csd.notexists_rationale'] && form['csd.notexists_rationale'].value) {
						currentParams.rationale = form['csd.khongtontai_rationale'].value;
					}
					break;
	
				case 'templatecat':  // G8
					if (form['csd.templatecat_rationale'] && form['csd.templatecat_rationale'].value) {
						currentParams.rationale = form['csd.templatecat_rationale'].value;
					}
					break;
	
				case 'attack':  // C11
					currentParams.blanked = 'yes';
					// it is actually blanked elsewhere in code, but setting the flag here
					break;
	
				case 'copyvio':  // C13
					if (form['csd.copyvio_url'] && form['csd.copyvio_url'].value) {
						currentParams.url = form['csd.copyvio_url'].value;
					}
					if (form['csd.copyvio_url2'] && form['csd.copyvio_url2'].value) {
						currentParams.url2 = form['csd.copyvio_url2'].value;
					}
					if (form['csd.copyvio_url3'] && form['csd.copyvio_url3'].value) {
						currentParams.url3 = form['csd.copyvio_url3'].value;
					}
					break;
	
				case 'afc':  // G13
					currentParams.ts = '$TIMESTAMP'; // to be replaced by the last revision timestamp when page is saved
					break;
	
				case 'redundantimage':  // TT1
					if (form['csd.redundantimage_filename']) {
						var redimage = form['csd.redundantimage_filename'].value;
						if (!redimage || !redimage.trim()) {
							alert('CSD TT1:  Vui lòng chỉ định tên tập tin của tập tin khác.');
							parameters = null;
							return false;
						}
						currentParams.filename = /^\s*(Image|File):/i.test(redimage) ? redimage : 'File:' + redimage;
					}
					break;
	
				case 'badfairuse':  // TT7
					if (form['csd.badfairuse_rationale'] && form['csd.badfairuse_rationale'].value) {
						currentParams.rationale = form['csd.badfairuse_rationale'].value;
					}
					break;
	
				case 'commons':  // TT8
					if (form['csd.commons_filename']) {
						var filename = form['csd.commons_filename'].value;
						if (filename && filename.trim() && filename !== Morebits.pageNameNorm) {
							currentParams.filename = /^\s*(Image|File):/i.test(filename) ? filename : 'File:' + filename;
						}
					}
					break;
	
				case 'imgcopyvio':  // TT9
					if (form['csd.imgcopyvio_url'] && form['csd.imgcopyvio_rationale']) {
						var tt9url = form['csd.imgcopyvio_url'].value;
						var tt9rationale = form['csd.imgcopyvio_rationale'].value;
						if ((!tt9url || !tt9url.trim()) && (!tt9rationale || !tt9rationale.trim())) {
							alert('TCXN TT9: Bạn phải nhập url hoặc lý do (hoặc cả hai) khi đề cử tập tin theo tiêu chí TT9.');
							parameters = null;
							return false;
						}
						if (form['csd.imgcopyvio_url'].value) {
							currentParams.url = tt9url;
						}
						if (form['csd.imgcopyvio_rationale'].value) {
							currentParams.rationale = tt9rationale;
						}
					}
					break;
	
				case 'noidungsaochep':  // BV3
					if (form['csd.baisaochep']) {
						var duptitle = form['csd.baisaochep'].value;
						if (!duptitle || !duptitle.trim()) {
							alert('TCXN BV3:  Vui lòng chỉ rõ tên bài viết trùng lặp nội dung.');
							parameters = null;
							return false;
						}
						currentParams.article = duptitle;
					}
					break;
	
				case 'transwiki':  // A5
					if (form['csd.transwiki_location'] && form['csd.transwiki_location'].value) {
						currentParams.location = form['csd.transwiki_location'].value;
					}
					break;
	
				// Case này hiện không có trong thực tế
				case 'bv3':  // A10 
					if (form['csd.bv3_article']) {
						var duptitle = form['csd.bv3_article'].value;
						if (!duptitle || !duptitle.trim()) {
							alert('TCXN BV3:  Vui lòng chỉ rõ tên bài viết trùng lặp nội dung.');
							parameters = null;
							return false;
						}
						currentParams.article = duptitle;
					}
					break;
	
				case 'banmaukhonghuuich':  // BM2
					if (form['csd.bieuquyet_url'] && form['csd.bieuquyet_url'].value) {
						currentParams.url = form['csd.bieuquyet_url'].value;
					}
					break;
					
				case 'duplicatetemplate':  // T3
					if (form['csd.duplicatetemplate_2']) {
						var t3template = form['csd.duplicatetemplate_2'].value;
						if (!t3template || !t3template.trim()) {
							alert('TCXN T3:  Please specify the name of a template duplicated by this one.');
							parameters = null;
							return false;
						}
						currentParams.ts = '~~~~~';
						currentParams.template = t3template.replace(/^\s*Template:/i, '');
					}
					break;
	
				case 'ctt1':  // P1
					if (form['csd.p1_criterion']) {
						var criterion = form['csd.p1_criterion'].value;
						if (!criterion || !criterion.trim()) {
							alert('TCXN CTT1:  Vui lòng chỉ định một tiêu chí riêng lẻ.');
							parameters = null;
							return false;
						}
						currentParams.criterion = criterion;
					}
					break;
	
				default:
					break;
			}
			parameters.push(currentParams);
		});
		return parameters;
	};
	
	// Function for processing talk page notification template parameters
	// key1/value1: for {{db-criterion-[notice|deleted]}} (via {{db-csd-[notice|deleted]-custom}})
	// utparams.param: for {{db-[notice|deleted]-multiple}}
	Twinkle.speedy.getUserTalkParameters = function twinklespeedyGetUserTalkParameters(normalized, parameters) {
		var utparams = [];
	
		// Special cases
		if (normalized === 'db') {
			utparams['2'] = parameters['1'];
		} else if (normalized === 'g6') {
			utparams.key1 = 'to';
			utparams.value1 = Morebits.pageNameNorm;
		} else if (normalized === 'c13') { // vi phạm bản quyền
			['url', 'url2', 'url3'].forEach(function(item, idx) {
				if (parameters[item]) {
					idx++;
					utparams['key' + idx] = item;
					utparams['value' + idx] = utparams[item] = parameters[item];
				}
			});
		} else {
			// Handle the rest
			var param;
			switch (normalized) {
				case 'c4': // g4
					param = 'xfd';
					break;
				/*case 'a2': // a2
					param = 'source';
					break;*/
				/*case 'a5': // a5
					param = 'location';
					break;*/
				case 'bv3': // a10
					param = 'article';
					break;
				case 'tt9': // f9
					param = 'url';
					break;
				case 'ctt1': // p1
					param = 'criterion';
					break;
				default:
					break;
			}
			// No harm in providing a usertalk template with the others' parameters
			if (param && parameters[param]) {
				utparams.key1 = param;
				utparams.value1 = utparams[param] = parameters[param];
			}
		}
		return utparams;
	};
	
	
	Twinkle.speedy.resolveCsdValues = function twinklespeedyResolveCsdValues(e) {
		var values = (e.target.form ? e.target.form : e.target).getChecked('csd');
		if (values.length === 0) {
			alert('Vui lòng chọn một tiêu chí!');
			return null;
		}
		return values;
	};
	
	Twinkle.speedy.callback.evaluateSysop = function twinklespeedyCallbackEvaluateSysop(e) {
		var form = e.target.form ? e.target.form : e.target;
	
		if (e.target.type === 'checkbox' || e.target.type === 'text' ||
				e.target.type === 'select') {
			return;
		}
	
		var tag_only = form.tag_only;
		if (tag_only && tag_only.checked) {
			Twinkle.speedy.callback.evaluateUser(e);
			return;
		}
	
		var values = Twinkle.speedy.resolveCsdValues(e);
		if (!values) {
			return;
		}
		var templateParams = Twinkle.speedy.getParameters(form, values);
		if (!templateParams) {
			return;
		}
	
		var normalizeds = values.map(function(value) {
			return Twinkle.speedy.normalizeHash[value];
		});
	
		// analyse each criterion to determine whether to watch the page, prompt for summary, or notify the creator
		var watchPage, promptForSummary;
		normalizeds.forEach(function(norm) {
			if (Twinkle.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
				watchPage = true;
			}
			if (Twinkle.getPref('promptForSpeedyDeletionSummary').indexOf(norm) !== -1) {
				promptForSummary = true;
			}
		});
	
		var warnusertalk = false;
		if (form.warnusertalk.checked) {
			$.each(normalizeds, function(index, norm) {
				if (Twinkle.getPref('warnUserOnSpeedyDelete').indexOf(norm) !== -1) {
					if (norm === 'c6' && values[index] !== 'copypaste') {
						return true;
					}
					warnusertalk = true;
					return false;  // break
				}
			});
		}
	
		var welcomeuser = false;
		if (warnusertalk) {
			$.each(normalizeds, function(index, norm) {
				if (Twinkle.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1) {
					welcomeuser = true;
					return false;  // break
				}
			});
		}
	
		var params = {
			values: values,
			normalizeds: normalizeds,
			watch: watchPage,
			deleteTalkPage: form.talkpage && form.talkpage.checked,
			deleteRedirects: form.redirects.checked,
			warnUser: warnusertalk,
			welcomeuser: welcomeuser,
			promptForSummary: promptForSummary,
			templateParams: templateParams
		};
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);
	
		Twinkle.speedy.callbacks.sysop.main(params);
	};
	
	Twinkle.speedy.callback.evaluateUser = function twinklespeedyCallbackEvaluateUser(e) {
		var form = e.target.form ? e.target.form : e.target;
	
		if (e.target.type === 'checkbox' || e.target.type === 'text' ||
				e.target.type === 'select') {
			return;
		}
	
		var values = Twinkle.speedy.resolveCsdValues(e);
		if (!values) {
			return;
		}
		var templateParams = Twinkle.speedy.getParameters(form, values);
		if (!templateParams) {
			return;
		}
	
		// var multiple = form.multiple.checked;
		var normalizeds = [];
		$.each(values, function(index, value) {
			var norm = Twinkle.speedy.normalizeHash[value];
	
			normalizeds.push(norm);
		});
	
		// analyse each criterion to determine whether to watch the page/notify the creator
		var watchPage = false;
		$.each(normalizeds, function(index, norm) {
			if (Twinkle.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
				watchPage = true;
				return false;  // break
			}
		});
	
		var notifyuser = false;
		if (form.notify.checked) {
			$.each(normalizeds, function(index, norm) {
				if (Twinkle.getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1) {
					if (norm === 'c6' && values[index] !== 'copypaste') { // g6
						return true;
					}
					notifyuser = true;
					return false;  // break
				}
			});
		}
	
		var welcomeuser = false;
		if (notifyuser) {
			$.each(normalizeds, function(index, norm) {
				if (Twinkle.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1) {
					welcomeuser = true;
					return false;  // break
				}
			});
		}
	
		var csdlog = false;
		if (Twinkle.getPref('logSpeedyNominations')) {
			$.each(normalizeds, function(index, norm) {
				if (Twinkle.getPref('noLogOnSpeedyNomination').indexOf(norm) === -1) {
					csdlog = true;
					return false;  // break
				}
			});
		}
	
		var params = {
			values: values,
			normalizeds: normalizeds,
			watch: watchPage,
			usertalk: notifyuser,
			welcomeuser: welcomeuser,
			lognomination: csdlog,
			requestsalt: form.salting.checked,
			templateParams: templateParams
		};
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);
	
		Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
		Morebits.wiki.actionCompleted.notice = 'Gắn thẻ hoàn tất';
	
		var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Đang gắn thẻ trang');
		wikipedia_page.setChangeTags(Twinkle.changeTags); // Here to apply to triage
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.load(Twinkle.speedy.callbacks.user.main);
	};
	
	Twinkle.addInitCallback(Twinkle.speedy, 'speedy');
	})(jQuery);
	
	
	// </nowiki>
	