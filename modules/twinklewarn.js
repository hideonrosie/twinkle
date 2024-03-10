// <nowiki>


(function($) {


	/*
	 ****************************************
	 *** twinklewarn.js: Warn module
	 ****************************************
	 * Mode of invocation:     Tab ("Cảnh báo")
	 * Active on:              Any page with relevant user name (userspace, contribs,
	 *                         etc.), as well as the rollback success page
	 */
	
	Twinkle.warn = function twinklewarn() {
	
		if (mw.config.get('wgRelevantUserName')) {
			Twinkle.addPortletLink(Twinkle.warn.callback, 'Cảnh báo', 'tw-warn', 'Cảnh báo/thông báo thành viên');
			if (Twinkle.getPref('autoMenuAfterRollback') &&
				mw.config.get('wgNamespaceNumber') === 3 &&
				mw.util.getParamValue('vanarticle') &&
				!mw.util.getParamValue('friendlywelcome') &&
				!mw.util.getParamValue('noautowarn')) {
				Twinkle.warn.callback();
			}
		}
	
		// Modify URL of talk page on rollback success pages, makes use of a
		// custom message box in [[MediaWiki:Rollback-success]]
		if (mw.config.get('wgAction') === 'rollback') {
			var $vandalTalkLink = $('#mw-rollback-success').find('.mw-usertoollinks a').first();
			if ($vandalTalkLink.length) {
				$vandalTalkLink.css('font-weight', 'bold');
				$vandalTalkLink.wrapInner($('<span/>').attr('title', 'Nếu thích hợp, bạn có thể sử dụng Twinkle để cảnh báo người dùng về các chỉnh sửa của họ đối với trang này.'));
	
				// Can't provide vanarticlerevid as only wgCurRevisionId is provided
				var extraParam = 'vanarticle=' + mw.util.rawurlencode(Morebits.pageNameNorm);
				var href = $vandalTalkLink.attr('href');
				if (href.indexOf('?') === -1) {
					$vandalTalkLink.attr('href', href + '?' + extraParam);
				} else {
					$vandalTalkLink.attr('href', href + '&' + extraParam);
				}
			}
		}
	};
	
	// Used to close window when switching to ARV in autolevel
	Twinkle.warn.dialog = null;
	
	Twinkle.warn.callback = function twinklewarnCallback() {
		if (mw.config.get('wgRelevantUserName') === mw.config.get('wgUserName') &&
			!confirm('Bạn sắp cảnh báo chính mình! Bạn có chắc muốn tiếp tục?')) {
			return;
		}
	
		var dialog;
		Twinkle.warn.dialog = new Morebits.simpleWindow(600, 440);
		dialog = Twinkle.warn.dialog;
		dialog.setTitle('Cảnh báo/thông báo người dùng');
		dialog.setScriptName('Twinkle');
		dialog.addFooterLink('Chọn cấp độ cảnh báo', 'WP:UWUL#Danh sách bản mẫu');
		dialog.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#cảnh báo');
	
		var form = new Morebits.quickForm(Twinkle.warn.callback.evaluate);
		var main_select = form.append({
			type: 'field',
			label: 'Chọn loại cảnh báo/thông báo cần sử dụng',
			tooltip: 'Trước tiên, hãy chọn một nhóm cảnh báo chính, sau đó chọn cảnh báo cụ thể.'
		});
	
		var main_group = main_select.append({
			type: 'select',
			name: 'main_group',
			tooltip: 'Bạn có thể thay đổi lựa chọn mặc định trong Tùy chọn Twinkle của mình',
			event: Twinkle.warn.callback.change_category
		});
	
		var defaultGroup = parseInt(Twinkle.getPref('defaultWarningGroup'), 10);
		main_group.append({ type: 'option', label: 'Tự động chọn cấp độ (1-4)', value: 'autolevel', selected: defaultGroup === 11 });
		main_group.append({ type: 'option', label: '1: Lưu ý chung', value: 'level1', selected: defaultGroup === 1 });
		main_group.append({ type: 'option', label: '2: Chú ý', value: 'level2', selected: defaultGroup === 2 });
		main_group.append({ type: 'option', label: '3: Cảnh báo', value: 'level3', selected: defaultGroup === 3 });
		main_group.append({ type: 'option', label: '4: Cảnh báo cuối cùng', value: 'level4', selected: defaultGroup === 4 });
		main_group.append({ type: 'option', label: '4im: Chỉ sử dụng cảnh báo', value: 'level4im', selected: defaultGroup === 5 });
		if (Twinkle.getPref('combinedSingletMenus')) {
			main_group.append({ type: 'option', label: 'Tin nhắn về một vấn đề', value: 'singlecombined', selected: defaultGroup === 6 || defaultGroup === 7 });
		} else {
			main_group.append({ type: 'option', label: 'Thông báo về một vấn đề', value: 'singlenotice', selected: defaultGroup === 6 });
			main_group.append({ type: 'option', label: 'Cảnh báo một vấn đề', value: 'singlewarn', selected: defaultGroup === 7 });
		}
		if (Twinkle.getPref('customWarningList').length) {
			main_group.append({ type: 'option', label: 'Cảnh báo tùy chỉnh', value: 'custom', selected: defaultGroup === 9 });
		}
		main_group.append({ type: 'option', label: 'Tất cả bản mẫu cảnh báo', value: 'kitchensink', selected: defaultGroup === 10 });
	
		main_select.append({ type: 'select', name: 'sub_group', event: Twinkle.warn.callback.change_subcategory }); // Will be empty to begin with.
	
		form.append({
			type: 'input',
			name: 'article',
			label: 'Trang được liên kết',
			value: mw.util.getParamValue('vanarticle') || '',
			tooltip: 'Một trang có thể được liên kết bên trong thông báo, có lẽ vì nó được lùi lại về trang đã gửi thông báo này. Để trống nếu không có trang nào được liên kết.'
		});
	
		form.append({
			type: 'div',
			label: '',
			style: 'color: red',
			id: 'twinkle-warn-warning-messages'
		});
	
	
		var more = form.append({ type: 'field', name: 'reasonGroup', label: 'Thông tin cảnh báo' });
		more.append({ type: 'textarea', label: 'Tin nhắn tùy chỉnh:', name: 'reason', tooltip: 'Có lẽ một lý do hoặc một thông báo chi tiết hơn phải được thêm vào' });
	
		var previewlink = document.createElement('a');
		$(previewlink).click(function() {
			Twinkle.warn.callbacks.preview(result);  // |result| is defined below
		});
		previewlink.style.cursor = 'pointer';
		previewlink.textContent = 'Xem trước';
		more.append({ type: 'div', id: 'warningpreview', label: [ previewlink ] });
		more.append({ type: 'div', id: 'twinklewarn-previewbox', style: 'display: none' });
	
		more.append({ type: 'submit', label: 'Gửi' });
	
		var result = form.render();
		dialog.setContent(result);
		dialog.display();
		result.main_group.root = result;
		result.previewer = new Morebits.wiki.preview($(result).find('div#twinklewarn-previewbox').last()[0]);
	
		// Potential notices for staleness and missed reverts
		var vanrevid = mw.util.getParamValue('vanarticlerevid');
		if (vanrevid) {
			var message = '';
			var query = {};
	
			// If you tried reverting, check if *you* actually reverted
			if (!mw.util.getParamValue('noautowarn') && mw.util.getParamValue('vanarticle')) { // Via fluff link
				query = {
					action: 'query',
					titles: mw.util.getParamValue('vanarticle'),
					prop: 'revisions',
					rvstartid: vanrevid,
					rvlimit: 2,
					rvdir: 'newer',
					rvprop: 'user'
				};
	
				new Morebits.wiki.api('Kiểm tra xem bạn đã lùi lại (revert) trang thành công', query, function(apiobj) {
					var revertUser = $(apiobj.getResponse()).find('revisions rev')[1].getAttribute('user');
					if (revertUser && revertUser !== mw.config.get('wgUserName')) {
						message += ' Ai đó đã lùi lại (revert) trang và có thể đã cảnh báo người dùng.';
						$('#twinkle-warn-warning-messages').text('Note:' + message);
					}
				}).post();
			}
	
			// Confirm edit wasn't too old for a warning
			var checkStale = function(vantimestamp) {
				var revDate = new Morebits.date(vantimestamp);
				if (vantimestamp && revDate.isValid()) {
					if (revDate.add(24, 'hours').isBefore(new Date())) {
						message += ' Chỉnh sửa này đã được thực hiện hơn 24 giờ trước nên một cảnh báo có thể đã cũ.';
						$('#twinkle-warn-warning-messages').text('Note:' + message);
					}
				}
			};
	
			var vantimestamp = mw.util.getParamValue('vantimestamp');
			// Provided from a fluff module-based revert, no API lookup necessary
			if (vantimestamp) {
				checkStale(vantimestamp);
			} else {
				query = {
					action: 'query',
					prop: 'revisions',
					rvprop: 'timestamp',
					revids: vanrevid
				};
				new Morebits.wiki.api('Lấy giá trị thời gian phiên bản sửa đổi', query, function(apiobj) {
					vantimestamp = $(apiobj.getResponse()).find('revisions rev').attr('timestamp');
					checkStale(vantimestamp);
				}).post();
			}
		}
	
	
		// We must init the first choice (General Note);
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.main_group.dispatchEvent(evt);
	};
	
	// This is all the messages that might be dispatched by the code
	// Each of the individual templates require the following information:
	//   label (required): A short description displayed in the dialog
	//   summary (required): The edit summary used. If an article name is entered, the summary is postfixed with "on [[article]]", and it is always postfixed with "."
	//   suppressArticleInSummary (optional): Set to true to suppress showing the article name in the edit summary. Useful if the warning relates to attack pages, or some such.
	Twinkle.warn.messages = {
		levels: {
			'Cảnh báo/Nhắc nhở chung': {
				'uw-vandalism': {
					level1: {
						label: 'Phá hoại',
						summary: 'Lưu ý chung: Chỉnh sửa không theo quy định'
					},
					level2: {
						label: 'Phá hoại',
						summary: 'Lưu ý: Chỉnh sửa không theo quy định'
					},
					level3: {
						label: 'Phá hoại',
						summary: 'Cảnh báo: Phá hoại'
					},
					level4: {
						label: 'Phá hoại',
						summary: 'Cảnh báo cuối cùng: Phá hoại'
					},
					level4im: {
						label: 'Phá hoại',
						summary: 'Chỉ dùng để cảnh báo: Phá hoại'
					}
				},
				'uw-disruptive': {
					level1: {
						label: 'Sửa đổi gây hại',
						summary: 'Lưu ý chung: Chỉnh sửa không theo quy định'
					},
					level2: {
						label: 'Sửa đổi gây hại',
						summary: 'Lưu ý: Chỉnh sửa không theo quy định'
					},
					level3: {
						label: 'Sửa đổi gây hại',
						summary: 'Cảnh báo: Chỉnh sửa không theo quy định'
					}
				},
				'uw-test': {
					level1: {
						label: 'Sửa đổi thử nghiệm',
						summary: 'Lưu ý chung: Sửa đổi thử nghiệm'
					},
					level2: {
						label: 'Sửa đổi thử nghiệm',
						summary: 'Lưu ý: Sửa đổi thử nghiệm'
					},
					level3: {
						label: 'Sửa đổi thử nghiệm',
						summary: 'Cảnh báo: Sửa đổi thử nghiệm'
					}
				},
				'uw-delete': {
					level1: {
						label: 'Xóa nội dung, tẩy trống',
						summary: 'Lưu ý chung: Xóa nội dung, tẩy trống'
					},
					level2: {
						label: 'Xóa nội dung, tẩy trống',
						summary: 'Lưu ý: Xóa nội dung, tẩy trống'
					},
					level3: {
						label: 'Xóa nội dung, tẩy trống',
						summary: 'Cảnh báo: Xóa nội dung, tẩy trống'
					},
					level4: {
						label: 'Xóa nội dung, tẩy trống',
						summary: 'Cảnh báo cuối cùng: Xóa nội dung, tẩy trống'
					},
					level4im: {
						label: 'Xóa nội dung, tẩy trống',
						summary: 'Chỉ dùng để cảnh báo: Xóa nội dung, tẩy trống'
					}
				},
				'uw-generic': {
					level4: {
						label: 'Cảnh báo chung (đối với bản mẫu liên tiếp thiếu mức 4)',
						summary: 'Thông báo cảnh báo cuối cùng'
					}
				}
			},
			'Hành vi trong bài viết': {
				'uw-interlink': {
					level1: {
						label: 'Liên kết ngoại ngữ',
						summary: 'Lưu ý chung: Liên kết ngoại ngữ với bài dịch từ các dự án Wikipedia khác'
					}
				},
				'uw-machinetranslation': {
					level1: {
						label: 'Cảnh báo dịch máy',
						summary: 'Lưu ý chung: Cảnh báo dịch máy với bài dịch từ các dự án Wikipedia khác'
					}
				},
				'uw-biog': {
					level1: {
						label: 'Thêm thông tin gây tranh cãi không nguồn về người sống',
						summary: 'Lưu ý chung: Thêm thông tin gây tranh cãi không nguồn về người sống'
					},
					level2: {
						label: 'Thêm thông tin gây tranh cãi không nguồn về người sống',
						summary: 'Cảnh báo: Thêm thông tin gây tranh cãi không nguồn về người sống'
					},
					level3: {
						label: 'Thêm thông tin gây tranh cãi/phỉ báng không nguồn về người sống',
						summary: 'Cảnh báo: Thêm thông tin gây tranh cãi không nguồn về người sống'
					},
					level4: {
						label: 'Thêm thông tin gây tranh cãi/phỉ báng không nguồn về người sống',
						summary: 'Cảnh báo cuối cùng: Thêm thông tin gây tranh cãi không nguồn về người sống'
					},
					level4im: {
						label: 'Thêm thông tin phỉ báng không nguồn về người sống',
						summary: 'Chỉ dùng để cảnh báo: Thêm thông tin gây tranh cãi không nguồn về người sống'
					}
				},
				'uw-defamatory': {
					level1: {
						label: 'Thêm vào nội dung phỉ báng',
						summary: 'Lưu ý chung: Thêm vào nội dung phỉ báng'
					},
					level2: {
						label: 'Thêm vào nội dung phỉ báng',
						summary: 'Cảnh báo: Thêm vào nội dung phỉ báng'
					},
					level3: {
						label: 'Thêm vào nội dung phỉ báng',
						summary: 'Cảnh báo: Thêm vào nội dung phỉ báng'
					},
					level4: {
						label: 'Thêm vào nội dung phỉ báng',
						summary: 'Cảnh báo cuối cùng: Thêm vào nội dung phỉ báng'
					},
					level4im: {
						label: 'Thêm vào nội dung phỉ báng',
						summary: 'Chỉ dùng để cảnh báo: Thêm vào nội dung phỉ báng'
					}
				},
				'uw-error': {
					level1: {
						label: 'Thêm thông tin sai',
						summary: 'Lưu ý chung: Thêm thông tin sai'
					},
					level2: {
						label: 'Thêm thông tin sai',
						summary: 'Cảnh báo: Thêm thông tin saic'
					},
					level3: {
						label: 'Thêm thông tin sai',
						summary: 'Cảnh báo: Cố ý thêm thông tin sai'
					},
					level4: {
						label: 'Thêm thông tin sai',
						summary: 'Cảnh báo cuối cùng: Cố ý thêm thông tin sai'
					}
				},
				//'uw-genre': {
				//	level1: {
				//		label: 'Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn',
				//		summary: 'Lưu ý chung: Frequent or mass changes to genres without consensus or references'
				//	},
				//	level2: {
				//		label: 'Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn',
				//		summary: 'Cảnh báo: Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn'
				//	},
				//	level3: {
				//		label: 'Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn',
				//		summary: 'Cảnh báo: Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn'
				//	},
				//	level4: {
				//		label: 'Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn',
				//		summary: 'Cảnh báo cuối cùng: Thay đổi thường xuyên hoặc hàng loạt đối với thể loại mà không có sự đồng thuận hoặc nguồn dẫn'
				//	}
				//},
				'uw-image': {
					level1: {
						label: 'Phá hoại liên quan đến hình ảnh trong các bài viết',
						summary: 'Lưu ý chung: Phá hoại liên quan đến hình ảnh trong các bài viết'
					},
					level2: {
						label: 'Phá hoại liên quan đến hình ảnh trong các bài viết',
						summary: 'Cảnh báo: Phá hoại liên quan đến hình ảnh trong các bài viết'
					},
					level3: {
						label: 'Phá hoại liên quan đến hình ảnh trong các bài viết',
						summary: 'Cảnh báo: Phá hoại liên quan đến hình ảnh trong các bài viết'
					},
					level4: {
						label: 'Phá hoại liên quan đến hình ảnh trong các bài viết',
						summary: 'Cảnh báo cuối cùng: Phá hoại liên quan đến hình ảnh trong các bài viết'
					},
					level4im: {
						label: 'Phá hoại liên quan đến hình ảnh',
						summary: 'Chỉ dùng để cảnh báo: Image-related vandalism'
					}
				},
				'uw-joke': {
					level1: {
						label: 'Thêm nội dung hài hước, đùa giỡn vào bài',
						summary: 'Lưu ý chung: Thêm nội dung hài hước, đùa giỡn vào bài'
					},
					level2: {
						label: 'Thêm nội dung hài hước, đùa giỡn vào bài',
						summary: 'Cảnh báo: Thêm nội dung hài hước, đùa giỡn vào bài'
					},
					level3: {
						label: 'Thêm nội dung hài hước, đùa giỡn vào bài',
						summary: 'Cảnh báo: Thêm nội dung hài hước, đùa giỡn vào bài'
					},
					level4: {
						label: 'Thêm nội dung hài hước, đùa giỡn vào bài',
						summary: 'Cảnh báo cuối cùng: Thêm nội dung hài hước, đùa giỡn vào bài'
					},
					level4im: {
						label: 'Thêm nội dung hài hước, đùa giỡn vào bài',
						summary: 'Chỉ dùng để cảnh báo: Thêm nội dung hài hước, đùa giỡn vào bài'
					}
				},
				'uw-nor': {
					level1: {
						label: 'Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản',
						summary: 'Lưu ý chung: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản'
					},
					level2: {
						label: 'Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản',
						summary: 'Cảnh báo: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản'
					},
					level3: {
						label: 'Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản',
						summary: 'Cảnh báo: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản'
					},
					level4: {
						label: 'Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản',
						summary: 'Cảnh báo cuối cùng: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản'
					}
				},
				'uw-notcensored': {
					level1: {
						label: 'Kiểm duyệt tài liệu',
						summary: 'Lưu ý chung: Kiểm duyệt tài liệu'
					},
					level2: {
						label: 'Kiểm duyệt tài liệu',
						summary: 'Cảnh báo: Kiểm duyệt tài liệu'
					},
					level3: {
						label: 'Kiểm duyệt tài liệu',
						summary: 'Cảnh báo: Kiểm duyệt tài liệu'
					}
				},
				'uw-own': {
					level1: {
						label: 'Sở hữu bài viết',
						summary: 'Lưu ý chung: Sở hữu bài viết'
					},
					level2: {
						label: 'Sở hữu bài viết',
						summary: 'Cảnh báo: Sở hữu bài viết'
					},
					level3: {
						label: 'Sở hữu bài viết',
						summary: 'Cảnh báo: Sở hữu bài viết'
					},
					level4: {
						label: 'Sở hữu bài viết',
						summary: 'Cảnh báo cuối cùng: Sở hữu bài viết'
					},
					level4im: {
						label: 'Sở hữu bài viết',
						summary: 'Chỉ dùng để cảnh báo: Sở hữu bài viết'
					}
				},
				'uw-tdel': {
					level1: {
						label: 'Xóa các bản mẫu bảo trì',
						summary: 'Lưu ý chung: Xóa các bản mẫu bảo trì'
					},
					level2: {
						label: 'Xóa các bản mẫu bảo trì',
						summary: 'Cảnh báo: Xóa các bản mẫu bảo trì'
					},
					level3: {
						label: 'Xóa các bản mẫu bảo trì',
						summary: 'Cảnh báo: Xóa các bản mẫu bảo trì'
					},
					level4: {
						label: 'Xóa các bản mẫu bảo trì',
						summary: 'Cảnh báo cuối cùng: Xóa các bản mẫu bảo trì'
					}
				},
				'uw-unsourced': {
					level1: {
						label: 'Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp',
						summary: 'Lưu ý chung: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp'
					},
					level2: {
						label: 'Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp',
						summary: 'Cảnh báo: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp'
					},
					level3: {
						label: 'Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp',
						summary: 'Cảnh báo: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp'
					},
					level4: {
						label: 'Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp',
						summary: 'Cảnh báo cuối cùng: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp'
					}
				}
			},
			'Quảng cáo và thư rác': {
				'uw-advert': {
					level1: {
						label: 'Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi',
						summary: 'Lưu ý chung: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi'
					},
					level2: {
						label: 'Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi',
						summary: 'Cảnh báo: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi'
					},
					level3: {
						label: 'Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi',
						summary: 'Cảnh báo: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi'
					},
					level4: {
						label: 'Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi',
						summary: 'Cảnh báo cuối cùng: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi'
					},
					level4im: {
						label: 'Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi',
						summary: 'Chỉ dùng để cảnh báo: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi'
					}
				},
				'uw-npov': {
					level1: {
						label: 'Không tuân theo quan điểm trung lập',
						summary: 'Lưu ý chung: Không tuân theo quan điểm trung lập'
					},
					level2: {
						label: 'Không tuân theo quan điểm trung lập',
						summary: 'Cảnh báo: Không tuân theo quan điểm trung lập'
					},
					level3: {
						label: 'Không tuân theo quan điểm trung lập',
						summary: 'Cảnh báo: Không tuân theo quan điểm trung lập'
					},
					level4: {
						label: 'Không tuân theo quan điểm trung lập',
						summary: 'Cảnh báo cuối cùng: Không tuân theo quan điểm trung lập'
					}
				},
				'uw-paid': {
					level1: {
						label: 'Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia',
						summary: 'Lưu ý chung: Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia'
					},
					level2: {
						label: 'Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia',
						summary: 'Cảnh báo: Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia'
					},
					level3: {
						label: 'Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia',
						summary: 'Cảnh báo: Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia'
					},
					level4: {
						label: 'Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia',
						summary: 'Cảnh báo cuối cùng: Chỉnh sửa nhận thù lao mà không tiết lộ theo Điều khoản sử dụng của Wikimedia'
					}
				},
				'uw-spam': {
					level1: {
						label: 'Thêm các liên kết bên ngoài không phù hợp',
						summary: 'Lưu ý chung: Thêm các liên kết bên ngoài không phù hợp'
					},
					level2: {
						label: 'Thêm liên kết rác',
						summary: 'Cảnh báo: Thêm liên kết rác'
					},
					level3: {
						label: 'Thêm liên kết rác',
						summary: 'Cảnh báo: Thêm liên kết rác'
					},
					level4: {
						label: 'Thêm liên kết rác',
						summary: 'Cảnh báo cuối cùng: Thêm liên kết rác'
					},
					level4im: {
						label: 'Thêm liên kết rác',
						summary: 'Chỉ dùng để cảnh báo: Thêm liên kết rác'
					}
				}
			},
			'Hành vi đối với các biên tập viên khác': {
				'uw-agf': {
					level1: {
						label: 'Không thiện chí',
						summary: 'Lưu ý chung: Không thiện chí'
					},
					level2: {
						label: 'Không thiện chí',
						summary: 'Cảnh báo: Không thiện chí'
					},
					level3: {
						label: 'Không thiện chí',
						summary: 'Cảnh báo: Không thiện chí'
					}
				},
				'uw-harass': {
					level1: {
						label: 'Quấy rối người dùng khác',
						summary: 'Lưu ý chung: Quấy rối người dùng khác'
					},
					level2: {
						label: 'Quấy rối người dùng khác',
						summary: 'Cảnh báo: Quấy rối người dùng khác'
					},
					level3: {
						label: 'Quấy rối người dùng khác',
						summary: 'Cảnh báo: Quấy rối người dùng khác'
					},
					level4: {
						label: 'Quấy rối người dùng khác',
						summary: 'Cảnh báo cuối cùng: Quấy rối người dùng khác'
					},
					level4im: {
						label: 'Quấy rối người dùng khác',
						summary: 'Chỉ dùng để cảnh báo: Quấy rối người dùng khác'
					}
				},
				'uw-npa': {
					level1: {
						label: 'Tấn công cá nhân nhắm vào một biên tập viên cụ thể',
						summary: 'Lưu ý chung: Tấn công cá nhân nhắm vào một biên tập viên cụ thể'
					},
					level2: {
						label: 'Tấn công cá nhân nhắm vào một biên tập viên cụ thể',
						summary: 'Cảnh báo: Tấn công cá nhân nhắm vào một biên tập viên cụ thể'
					},
					level3: {
						label: 'Tấn công cá nhân nhắm vào một biên tập viên cụ thể',
						summary: 'Cảnh báo: Tấn công cá nhân nhắm vào một biên tập viên cụ thể'
					},
					level4: {
						label: 'Tấn công cá nhân nhắm vào một biên tập viên cụ thể',
						summary: 'Cảnh báo cuối cùng: Tấn công cá nhân nhắm vào một biên tập viên cụ thể'
					},
					level4im: {
						label: 'Tấn công cá nhân nhắm vào một biên tập viên cụ thể',
						summary: 'Chỉ dùng để cảnh báo: Tấn công cá nhân nhắm vào một biên tập viên cụ thể'
					}
				},
				'uw-tempabuse': {
					level1: {
						label: 'Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm',
						summary: 'Lưu ý chung: Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm'
					},
					level2: {
						label: 'Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm',
						summary: 'Cảnh báo: Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm'
					}
				}
			},
			'Xóa các thẻ xóa': {
				'uw-afd': {
					level1: {
						label: 'Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)',
						summary: 'Lưu ý chung: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)'
					},
					level2: {
						label: 'Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)',
						summary: 'Cảnh báo: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)'
					},
					level3: {
						label: 'Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)',
						summary: 'Cảnh báo: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)'
					},
					level4: {
						label: 'Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)',
						summary: 'Cảnh báo cuối cùng: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)'
					}
				},
				'uw-blpprod': {
					level1: {
						label: 'Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)',
						summary: 'Lưu ý chung: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)'
					},
					level2: {
						label: 'Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)',
						summary: 'Cảnh báo: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)'
					},
					level3: {
						label: 'Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)',
						summary: 'Cảnh báo: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)'
					},
					level4: {
						label: 'Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)',
						summary: 'Cảnh báo cuối cùng: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)'
					}
				},
				'uw-idt': {
					level1: {
						label: 'Xóa các thẻ xóa tập tin',
						summary: 'Lưu ý chung: Xóa các thẻ xóa tập tin'
					},
					level2: {
						label: 'Xóa các thẻ xóa tập tin',
						summary: 'Cảnh báo: Xóa các thẻ xóa tập tin'
					},
					level3: {
						label: 'Xóa các thẻ xóa tập tin',
						summary: 'Cảnh báo: Xóa các thẻ xóa tập tin'
					},
					level4: {
						label: 'Xóa các thẻ xóa tập tin',
						summary: 'Cảnh báo cuối cùng: Xóa các thẻ xóa tập tin'
					}
				},
				'uw-speedy': {
					level1: {
						label: 'Xóa các thẻ xóa nhanh',
						summary: 'Lưu ý chung: Xóa các thẻ xóa nhanh'
					},
					level2: {
						label: 'Xóa các thẻ xóa nhanh',
						summary: 'Cảnh báo: Xóa các thẻ xóa nhanh'
					},
					level3: {
						label: 'Xóa các thẻ xóa nhanh',
						summary: 'Cảnh báo: Xóa các thẻ xóa nhanh'
					},
					level4: {
						label: 'Xóa các thẻ xóa nhanh',
						summary: 'Cảnh báo cuối cùng: Xóa các thẻ xóa nhanh'
					}
				}
			},
			'Hình ảnh, tập tin': {
				'uw-ics': {
					level1: {
						label: 'Tải tập tin thiếu nguồn và giấy phép',
						summary: 'Lưu ý chung: Tải tập tin thiếu nguồn và giấy phép'
					},
					level2: {
						label: 'Tải tập tin thiếu nguồn và giấy phép',
						summary: 'Cảnh báo: Tải tập tin thiếu nguồn và giấy phép'
					},
					level3: {
						label: 'Tải tập tin thiếu nguồn và giấy phép',
						summary: 'Cảnh báo: Tải tập tin thiếu nguồn và giấy phép'
					},
					level4: {
						label: 'Tải tập tin thiếu nguồn và giấy phép',
						summary: 'Cảnh báo cuối cùng: Tải tập tin thiếu nguồn và giấy phép'
					},
					level4im: {
						label: 'Tải tập tin thiếu nguồn và giấy phép',
						summary: 'Chỉ dùng để cảnh báo: Tải tập tin thiếu nguồn và giấy phép'
					}
				},
				'uw-upload': {
					level1: {
						label: 'Tải hình ảnh không bách khoa',
						summary: 'Lưu ý chung: Tải hình ảnh không bách khoa'
					},
					level2: {
						label: 'Tải hình ảnh không bách khoa',
						summary: 'Cảnh báo: Tải hình ảnh không bách khoa'
					},
					level3: {
						label: 'Tải hình ảnh không bách khoa',
						summary: 'Cảnh báo: Tải hình ảnh không bách khoa'
					},
					level4: {
						label: 'Tải hình ảnh không bách khoa',
						summary: 'Cảnh báo cuối cùng: Tải hình ảnh không bách khoa'
					},
					level4im: {
						label: 'Tải hình ảnh không bách khoa',
						summary: 'Chỉ dùng để cảnh báo: Tải hình ảnh không bách khoa'
					}
				}	
			},
			'Khác': {
				//'uw-attempt': {
				//	level1: {
				//		label: 'Kích hoạt bộ lọc chỉnh sửa',
				//		summary: 'Lưu ý chung: Kích hoạt bộ lọc chỉnh sửa'
				//	},
				//	level2: {
				//		label: 'Kích hoạt bộ lọc chỉnh sửa',
				//		summary: 'Cảnh báo: Kích hoạt bộ lọc chỉnh sửa'
				//	},
				//	level3: {
				//		label: 'Kích hoạt bộ lọc chỉnh sửa',
				//		summary: 'Cảnh báo: Kích hoạt bộ lọc chỉnh sửa'
				//	},
				//	level4: {
				//		label: 'Kích hoạt bộ lọc chỉnh sửa',
				//		summary: 'Cảnh báo cuối cùng: Kích hoạt bộ lọc chỉnh sửa'
				//	}
				//},
				'uw-chat': {
					level1: {
						label: 'Biến trang thảo luận thành diễn đàn',
						summary: 'Lưu ý chung: Biến trang thảo luận thành diễn đàn'
					},
					level2: {
						label: 'Biến trang thảo luận thành diễn đàn',
						summary: 'Cảnh báo: Biến trang thảo luận thành diễn đàn'
					},
					level3: {
						label: 'Biến trang thảo luận thành diễn đàn',
						summary: 'Cảnh báo: Biến trang thảo luận thành diễn đàn'
					},
					level4: {
						label: 'Biến trang thảo luận thành diễn đàn',
						summary: 'Cảnh báo cuối cùng: Biến trang thảo luận thành diễn đàn'
					}
				},
				'uw-create': {
					level1: {
						label: 'Tạo các trang không hợp lệ',
						summary: 'Lưu ý chung: Tạo các trang không hợp lệ'
					},
					level2: {
						label: 'Tạo các trang không hợp lệ',
						summary: 'Cảnh báo: Tạo các trang không hợp lệ'
					},
					level3: {
						label: 'Tạo các trang không hợp lệ',
						summary: 'Cảnh báo: Tạo các trang không hợp lệ'
					},
					level4: {
						label: 'Tạo các trang không hợp lệ',
						summary: 'Cảnh báo cuối cùng: Tạo các trang không hợp lệ'
					},
					level4im: {
						label: 'Tạo các trang không hợp lệ',
						summary: 'Chỉ dùng để cảnh báo: Tạo các trang không hợp lệ'
					}
				},
				'uw-mos': {
					level1: {
						label: 'Cẩm nang biên soạn',
						summary: 'Lưu ý chung: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)'
					},
					level2: {
						label: 'Cẩm nang biên soạn',
						summary: 'Cảnh báo: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)'
					},
					level3: {
						label: 'Cẩm nang biên soạn',
						summary: 'Cảnh báo: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)'
					},
					level4: {
						label: 'Cẩm nang biên soạn',
						summary: 'Cảnh báo cuối cùng: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)'
					}
				},
				'uw-move': {
					level1: {
						label: 'Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận',
						summary: 'Lưu ý chung: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận'
					},
					level2: {
						label: 'Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận',
						summary: 'Cảnh báo: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận'
					},
					level3: {
						label: 'Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận',
						summary: 'Cảnh báo: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận'
					},
					level4: {
						label: 'Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận',
						summary: 'Cảnh báo cuối cùng: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận'
					},
					level4im: {
						label: 'Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận',
						summary: 'Chỉ dùng để cảnh báo: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận'
					}
				},
				'uw-plotsum': {
					level1: {
						label: 'Khiến tóm lược cốt truyện dài dòng và tiểu tiết',
						summary: 'Lưu ý chung: Khiến tóm lược cốt truyện dài dòng và tiểu tiết'
					},
					level2: {
						label: 'Khiến tóm lược cốt truyện dài dòng và tiểu tiết',
						summary: 'Lưu ý: Khiến tóm lược cốt truyện dài dòng và tiểu tiết'
					},
					level3: {
						label: 'Khiến tóm lược cốt truyện dài dòng và tiểu tiết',
						summary: 'Lưu ý: Khiến tóm lược cốt truyện dài dòng và tiểu tiết'
					},
				},
				'uw-tpv': {
					level1: {
						label: 'Phá hoại hay xóa thảo luận của người khác',
						summary: 'Lưu ý chung: Phá hoại hay xóa thảo luận của người khác'
					},
					level2: {
						label: 'Phá hoại hay xóa thảo luận của người khác',
						summary: 'Lưu ý: Phá hoại hay xóa thảo luận của người khác'
					},
					level3: {
						label: 'Phá hoại hay xóa thảo luận của người khác',
						summary: 'Cảnh báo: Phá hoại hay xóa thảo luận của người khác'
					},
					level4: {
						label: 'Phá hoại hay xóa thảo luận của người khác',
						summary: 'Cảnh báo cuối cùng: Phá hoại hay xóa thảo luận của người khác'
					},
					level4im: {
						label: 'Phá hoại hay xóa thảo luận của người khác',
						summary: 'Chỉ dùng để cảnh báo: Phá hoại hay xóa thảo luận của người khác'
					}
				},
			}
		},
	
		singlenotice: {
			'uw-aiv': {
				label: 'Báo cáo AIV không hợp lệ',
				summary: 'Thông báo: Bad AIV report'
			},
			'uw-autobiography': {
				label: 'Tạo tự truyện',
				summary: 'Thông báo: Tạo tự truyện'
			},
			'uw-badcat': {
				label: 'Thêm thể loại không chính xác',
				summary: 'Thông báo: Thêm thể loại không chính xác'
			},
			'uw-badlistentry': {
				label: 'Thêm các mục không phù hợp vào danh sách',
				summary: 'Thông báo: Thêm các mục không phù hợp vào danh sách'
			},
			'uw-bite': {
				label: '"Cắn" người mới đến',
				summary: 'Thông báo: "Cắn" người mới đến',
				suppressArticleInSummary: true  // non-standard (user name, not article), and not necessary
			},
			'uw-coi': {
				label: 'Xung đột lợi ích',
				summary: 'Thông báo: Xung đột lợi ích',
				heading: 'Xung đột lợi ích'
			},
			'uw-controversial': {
				label: 'Sửa đổi gây tranh cãi',
				summary: 'Thông báo: Sửa đổi gây tranh cãi'
			},
			//'uw-copying': {
			//	label: 'Sao chép văn bản sang trang khác',
			//	summary: 'Thông báo: Sao chép văn bản sang trang khác'
			//},
			//'uw-crystal': {
			//	label: 'Thêm thông tin suy đoán hoặc chưa được xác nhận',
			//	summary: 'Thông báo: Thêm thông tin suy đoán hoặc chưa được xác nhận'
			//},
			//'uw-c&pmove': {
			//	label: 'Cắt và dán nội dung sang nhiều trang',
			//	summary: 'Thông báo: Cắt và dán nội dung sang nhiều trang'
			//},
			//'uw-dab': {
			//	label: 'Chỉnh sửa không chính xác cho một trang định hướng',
			//	summary: 'Thông báo: Chỉnh sửa không chính xác cho một trang định hướng'
			//},
			//'uw-date': {
			//	label: 'Thay đổi định dạng ngày không cần thiết',
			//	summary: 'Thông báo: Thay đổi định dạng ngày không cần thiết'
			//},
			//'uw-deadlink': {
			//	label: 'Loại bỏ các nguồn thích hợp có chứa các liên kết chết',
			//	summary: 'Thông báo: Loại bỏ các nguồn thích hợp có chứa các liên kết chết'
			//},
			//'uw-draftfirst': {
			//	label: 'Người dùng nên nháp trong không gian người dùng của mình để tránh bị xóa nhanh nội dung',
			//	summary: 'Thông báo: Hãy soạn bài trong nháp theo hướng dẫn [[Wikipedia:Giới thiệu chỗ thử]]'
			//},
			'uw-editsummary': {
				label: 'Thiếu tóm lược sửa đổi',
				summary: 'Thông báo: Thiếu tóm lược sửa đổi'
			},
			'uw-elinbody': {
				label: 'Thêm liên kết ngoài vào thân bài',
				summary: 'Thông báo: Để các liên kết ngoài tại phần Liên kết ngoài ở cuối bài'
			},
			'uw-vietnamese': {
				label: 'Không giao tiếp bằng tiếng Việt',
				summary: 'Thông báo: Không giao tiếp bằng tiếng Việt'
			},
			'uw-hasty': {
				label: 'Thêm các thẻ xóa quá nhanh',
				summary: 'Thông báo: Cho phép người tạo bài có thời gian để cải thiện bài viết trước khi gắn thẻ xóa bài'
			},
			'uw-italicize': {
				label: 'In nghiêng sách, phim, album, tạp chí, phim truyền hình, v.v. trong các bài viết',
				summary: 'Thông báo: Hãy in nghiêng sách, phim, album, tạp chí, phim truyền hình, v.v. trong các bài viết'
			},
			'uw-lang': {
				label: 'Không cần phải thay đổi giữa tiếng Việt miền Bắc và tiếng Việt miền Nam',
				summary: 'Thông báo: Không cần phải thay đổi giữa tiếng Việt miền Bắc và tiếng Việt miền Nam',
				heading: 'Các địa phương sử dụng tiếng Việt'
			},
			'uw-linking': {
				label: 'Thêm quá nhiều liên kết đỏ hoặc liên kết xanh lặp lại',
				summary: 'Thông báo: Thêm quá nhiều liên kết đỏ hoặc liên kết xanh lặp lại'
			},
			'uw-minor': {
				label: 'Sử dụng sai hộp kiểm tra các chỉnh sửa nhỏ',
				summary: 'Thông báo: Sử dụng sai hộp kiểm tra các chỉnh sửa nhỏ'
			},
			'uw-notvietnamese': {
				label: 'Tạo các bài viết không phải tiếng Việt',
				summary: 'Thông báo: Tạo các bài viết không phải tiếng Việt'
			},
			'uw-notvote': {
				label: 'Chúng tôi xét đồng thuận chứ không đếm phiếu',
				summary: 'Thông báo: Chúng tôi xét đồng thuận chứ không đếm phiếu'
			},
			'uw-plagiarism': {
				label: 'Sao chép từ các nguồn từ phạm vi công cộng mà không cần ghi công',
				summary: 'Thông báo: Sao chép từ các nguồn từ phạm vi công cộng mà không cần ghi công'
			},
			'uw-preview': {
				label: 'Sử dụng nút xem trước để tránh nhầm lẫn',
				summary: 'Thông báo: Sử dụng nút xem trước để tránh nhầm lẫn'
			},
			'uw-redlink': {
				label: 'Xóa liên kết đỏ bừa bãi',
				summary: 'Thông báo: Xóa liên kết đỏ bừa bãi'
			},
			'uw-selfrevert': {
				label: 'Tự thử nghiệm lùi lại quá mức',
				summary: 'Thông báo: Tự thử nghiệm lùi lại quá mức'
			},
			'uw-socialnetwork': {
				label: 'Wikipedia không phải là một mạng xã hội',
				summary: 'Thông báo: Wikipedia không phải là một mạng xã hội'
			},
			'uw-sofixit': {
				label: 'Hãy mạnh dạn và tự sửa chữa mọi thứ',
				summary: 'Thông báo: Hãy mạnh dạn và tự sửa chữa mọi thứ'
			},
			//'uw-spoiler': {
				//label: 'Thêm cảnh báo kẻ phá hoại hoặc xóa kẻ phá rối khỏi các phần thích hợp',
				//summary: "Notice: Không xóa hoặc gắn cờ 'kẻ phá hoại' tiềm năng trong các bài viết trên Wikipedia"
			//},
			'uw-talkinarticle': {
				label: 'Thảo luận trong bài viết',
				summary: 'Thông báo: Thảo luận trong bài viết'
			},
			'uw-taxonomy1': {
				label: 'Sửa đổi khiến cho bản mẫu phân loại sinh vật bị lỗi',
				summary: 'Thông báo: Sửa đổi khiến cho bản mẫu phân loại sinh vật bị lỗi'
			},
			'uw-tilde': {
				label: 'Đăng nội dung (thảo luận) không ký tên',
				summary: 'Thông báo: Đăng nội dung (thảo luận) không ký tên'
			},
			'uw-toppost': {
				label: 'Đăng ở đầu các trang thảo luận',
				summary: 'Thông báo: Đăng ở đầu các trang thảo luận'
			},
			'uw-userspace draft finish': {
				label: 'Bản nháp không gian người dùng cũ',
				summary: 'Thông báo: Bản nháp không gian người dùng cũ'
			},
			'uw-vgscope': {
				label: 'Thêm hướng dẫn cách chơi trò chơi điện tử, mẹo gian lận hoặc chỉ dẫn',
				summary: 'Thông báo: Thêm hướng dẫn cách chơi trò chơi điện tử, mẹo gian lận hoặc chỉ dẫn'
			},
			'uw-warn': {
				label: 'Đặt các bản mẫu cảnh báo người dùng khi lùi lại hành vi phá hoại',
				summary: 'Thông báo: Bạn có thể sử dụng các bản mẫu cảnh báo người dùng khi lùi lại hành vi phá hoại'
			},
			//'uw-wrongsummary': {
			//	label: 'Viết tóm lược sửa đổi không chính xác hoặc không phù hợp',
			//	summary: 'Cảnh báo: Viết tóm lược sửa đổi không chính xác hoặc không phù hợp'
			//}
		},
	
		singlewarn: {
			'uw-3rr': {
				label: 'Vi phạm quy tắc ba lần hồi sửa; Xem thêm uw-ew',
				summary: 'Cảnh báo: ba lần hồi sửa'
			},
			'uw-affiliate': {
				label: 'Tiếp thị liên kết',
				summary: 'Cảnh báo: Tiếp thị liên kết'
			},
			'uw-agf-sock': {
				label: 'Sử dụng nhiều tài khoản (giả sử có thiện chí)',
				summary: 'Cảnh báo: Sử dụng nhiều tài khoản'
			},
			'uw-attack': {
				label: 'Tạo các trang tấn công',
				summary: 'Cảnh báo: Tạo các trang tấn công',
				suppressArticleInSummary: true
			},
			'uw-botun': {
				label: 'Tên người dùng bot',
				summary: 'Cảnh báo: Tên người dùng bot'
			},
			'uw-canvass': {
				label: 'Vận động',
				summary: 'Cảnh báo: Vận động'
			},
			'uw-copyright': {
				label: 'Vi phạm bản quyền',
				summary: 'Cảnh báo: Vi phạm bản quyền'
			},
			'uw-copyright-link': {
				label: 'Liên kết đến các vi phạm tác phẩm có bản quyền',
				summary: 'Cảnh báo: Liên kết đến các vi phạm tác phẩm có bản quyền'
			},
			//'uw-copyright-new': {
			//	label: 'Vi phạm bản quyền (có giải thích cho người dùng mới)',
			//	summary: 'Thông báo: Tránh các vấn đề về bản quyền',
			//	heading: 'Wikipedia và bản quyền'
			//},
			//'uw-copyright-remove': {
			//	label: 'Xóa các bản mẫu {{vi phạm bản quyền}} khỏi bài viết',
			//	summary: 'Cảnh báo: Xóa các bản mẫu {{vi phạm bản quyền}} khỏi bài viết'
			//},
			'uw-efsummary': {
				label: 'Tóm lược sửa đổi kích hoạt bộ lọc chỉnh sửa',
				summary: 'Cảnh báo: Tóm lược sửa đổi kích hoạt bộ lọc chỉnh sửa'
			},
			//'uw-ew': {
			//	label: 'Bút chiến (diễn đạt mức độ mạnh)',
			//	summary: 'Cảnh báo: Bút chiến'
			//},
			'uw-ewsoft': {
				label: 'Bút chiến (diễn đạt mức độ nhẹ với người mới)',
				summary: 'Cảnh báo: Bút chiến'
			},
			//'uw-hijacking': {
			//	label: 'Bài viết bị chiếm đoạt',
			//	summary: 'Cảnh báo: Bài viết bị chiếm đoạt'
			//},
			'uw-hoax': {
				label: 'Tạo trò lừa bịp',
				summary: 'Cảnh báo: Tạo trò lừa bịp'
			},
			'uw-legal': {
				label: 'Đe dọa pháp lý',
				summary: 'Cảnh báo: Đe dọa pháp lý'
			},
			'uw-login': {
				label: 'Chỉnh sửa khi đăng xuất',
				summary: 'Cảnh báo: Chỉnh sửa khi đăng xuất'
			},
			'uw-multipleIPs': {
				label: 'Sử dụng nhiều IP',
				summary: 'Cảnh báo: Phá hoại với nhiều IP'
			},
			'uw-pinfo': {
				label: 'Đăng thông tin cá nhân (của người khác)',
				summary: 'Cảnh báo: Thông tin cá nhân'
			},
			'uw-salt': {
				label: 'Tạo lại các bài bị khóa khởi tạo dưới một tiêu đề khác',
				summary: 'Thông báo: Tạo lại các bài bị khóa khởi tạo dưới một tiêu đề khác'
			},
			'uw-socksuspect': {
				label: 'Con rối',
				summary: 'Cảnh báo: Bạn là một người bị nghi ngờ [[Wikipedia:Tài khoản con rối]]'  // of User:...
			},
			'uw-upv': {
				label: 'Phá hoại trang thành viên',
				summary: 'Cảnh báo: Phá hoại trang thành viên'
			},
			'uw-username': {
				label: 'Tên người dùng vi phạm quy định (nên ghi lý do)',
				summary: 'Cảnh báo: Tên người dùng vi phạm quy định',
				suppressArticleInSummary: true  // not relevant for this template
			},
			'uw-coi-username': {
				label: 'Tên người dùng vi phạm quy định và xung đột lợi ích',
				summary: 'Cảnh báo: Tên người dùng vi phạm quy định và xung đột lợi ích',
				heading: 'Tên người dùng của bạn'
			},
			'uw-userpage': {
				label: 'Trang người dùng hoặc trang con vi phạm quy định',
				summary: 'Cảnh báo: Trang người dùng hoặc trang con vi phạm quy định'
			}
		}
	};
	
	// Used repeatedly below across menu rebuilds
	Twinkle.warn.prev_article = null;
	Twinkle.warn.prev_reason = null;
	Twinkle.warn.talkpageObj = null;
	
	Twinkle.warn.callback.change_category = function twinklewarnCallbackChangeCategory(e) {
		var value = e.target.value;
		var sub_group = e.target.root.sub_group;
		sub_group.main_group = value;
		var old_subvalue = sub_group.value;
		var old_subvalue_re;
		if (old_subvalue) {
			if (value === 'kitchensink') { // Exact match possible in kitchensink menu
				old_subvalue_re = new RegExp(mw.util.escapeRegExp(old_subvalue));
			} else {
				old_subvalue = old_subvalue.replace(/\d*(im)?$/, '');
				old_subvalue_re = new RegExp(mw.util.escapeRegExp(old_subvalue) + '(\\d*(?:im)?)$');
			}
		}
	
		while (sub_group.hasChildNodes()) {
			sub_group.removeChild(sub_group.firstChild);
		}
	
		var selected = false;
		// worker function to create the combo box entries
		var createEntries = function(contents, container, wrapInOptgroup, val) {
			val = typeof val !== 'undefined' ? val : value; // IE doesn't support default parameters
			// level2->2, singlewarn->''; also used to distinguish the
			// scaled levels from singlenotice, singlewarn, and custom
			var level = val.replace(/^\D+/g, '');
			// due to an apparent iOS bug, we have to add an option-group to prevent truncation of text
			// (search WT:TW archives for "Problem selecting warnings on an iPhone")
			if (wrapInOptgroup && $.client.profile().platform === 'iphone') {
				var wrapperOptgroup = new Morebits.quickForm.element({
					type: 'optgroup',
					label: 'Các bản mẫu có sẵn'
				});
				wrapperOptgroup = wrapperOptgroup.render();
				container.appendChild(wrapperOptgroup);
				container = wrapperOptgroup;
			}
	
			$.each(contents, function(itemKey, itemProperties) {
				// Skip if the current template doesn't have a version for the current level
				if (!!level && !itemProperties[val]) {
					return;
				}
				var key = typeof itemKey === 'string' ? itemKey : itemProperties.value;
				var template = key + level;
	
				var elem = new Morebits.quickForm.element({
					type: 'option',
					label: '{{' + template + '}}: ' + (level ? itemProperties[val].label : itemProperties.label),
					value: template
				});
	
				// Select item best corresponding to previous selection
				if (!selected && old_subvalue && old_subvalue_re.test(template)) {
					elem.data.selected = selected = true;
				}
				var elemRendered = container.appendChild(elem.render());
				$(elemRendered).data('messageData', itemProperties);
			});
		};
	
		switch (value) {
			case 'singlenotice':
			case 'singlewarn':
				createEntries(Twinkle.warn.messages[value], sub_group, true);
				break;
			case 'singlecombined':
				var unSortedSinglets = $.extend({}, Twinkle.warn.messages.singlenotice, Twinkle.warn.messages.singlewarn);
				var sortedSingletMessages = {};
				Object.keys(unSortedSinglets).sort().forEach(function(key) {
					sortedSingletMessages[key] = unSortedSinglets[key];
				});
				createEntries(sortedSingletMessages, sub_group, true);
				break;
			case 'custom':
				createEntries(Twinkle.getPref('customWarningList'), sub_group, true);
				break;
			case 'kitchensink':
				['level1', 'level2', 'level3', 'level4', 'level4im'].forEach(function(lvl) {
					$.each(Twinkle.warn.messages.levels, function(_, levelGroup) {
						createEntries(levelGroup, sub_group, true, lvl);
					});
				});
				createEntries(Twinkle.warn.messages.singlenotice, sub_group, true);
				createEntries(Twinkle.warn.messages.singlewarn, sub_group, true);
				createEntries(Twinkle.getPref('customWarningList'), sub_group, true);
				break;
			case 'level1':
			case 'level2':
			case 'level3':
			case 'level4':
			case 'level4im':
				// Creates subgroup regardless of whether there is anything to place in it;
				// leaves "Removal of deletion tags" empty for 4im
				$.each(Twinkle.warn.messages.levels, function(groupLabel, groupContents) {
					var optgroup = new Morebits.quickForm.element({
						type: 'optgroup',
						label: groupLabel
					});
					optgroup = optgroup.render();
					sub_group.appendChild(optgroup);
					// create the options
					createEntries(groupContents, optgroup, false);
				});
				break;
			case 'autolevel':
				// Check user page to determine appropriate level
				var autolevelProc = function() {
					var wikitext = Twinkle.warn.talkpageObj.getPageText();
					// history not needed for autolevel
					var latest = Twinkle.warn.callbacks.dateProcessing(wikitext)[0];
					// Pseudo-params with only what's needed to parse the level i.e. no messageData
					var params = {
						sub_group: old_subvalue,
						article: e.target.root.article.value
					};
					var lvl = 'level' + Twinkle.warn.callbacks.autolevelParseWikitext(wikitext, params, latest)[1];
	
					// Identical to level1, etc. above but explicitly provides the level
					$.each(Twinkle.warn.messages.levels, function(groupLabel, groupContents) {
						var optgroup = new Morebits.quickForm.element({
							type: 'optgroup',
							label: groupLabel
						});
						optgroup = optgroup.render();
						sub_group.appendChild(optgroup);
						// create the options
						createEntries(groupContents, optgroup, false, lvl);
					});
	
					// Trigger subcategory change, add select menu, etc.
					Twinkle.warn.callback.postCategoryCleanup(e);
				};
	
	
				if (Twinkle.warn.talkpageObj) {
					autolevelProc();
				} else {
					var usertalk_page = new Morebits.wiki.page('User_talk:' + mw.config.get('wgRelevantUserName'), 'Loading previous warnings');
					usertalk_page.setFollowRedirect(true, false);
					usertalk_page.load(function(pageobj) {
						Twinkle.warn.talkpageObj = pageobj; // Update talkpageObj
						autolevelProc();
					}, function() {
						// Catch and warn if the talkpage can't load,
						// most likely because it's a cross-namespace redirect
						// Supersedes the typical $autolevelMessage added in autolevelParseWikitext
						var $noTalkPageNode = $('<strong/>', {
							'text': 'Không thể tải trang thảo luận của người dùng; nó có thể là một chuyển hướng giữa nhiều không gian tên. Phát hiện cấp độ tự động sẽ không hoạt động.',
							'id': 'twinkle-warn-autolevel-message',
							'css': {'color': 'red' }
						});
						$noTalkPageNode.insertBefore($('#twinkle-warn-warning-messages'));
						// If a preview was opened while in a different mode, close it
						// Should nullify the need to catch the error in preview callback
						e.target.root.previewer.closePreview();
					});
				}
				break;
			default:
				alert('Nhóm cảnh báo không xác định rõ trong twinklewarn');
				break;
		}
	
		// Trigger subcategory change, add select menu, etc.
		// Here because of the async load for autolevel
		if (value !== 'autolevel') {
			// reset any autolevel-specific messages while we're here
			$('#twinkle-warn-autolevel-message').remove();
	
			Twinkle.warn.callback.postCategoryCleanup(e);
		}
	};
	
	Twinkle.warn.callback.postCategoryCleanup = function twinklewarnCallbackPostCategoryCleanup(e) {
		// clear overridden label on article textbox
		Morebits.quickForm.setElementTooltipVisibility(e.target.root.article, true);
		Morebits.quickForm.resetElementLabel(e.target.root.article);
		// Trigger custom label/change on main category change
		Twinkle.warn.callback.change_subcategory(e);
	
		// Use select2 to make the select menu searchable
		if (!Twinkle.getPref('oldSelect')) {
			$('select[name=sub_group]')
				.select2({
					width: '100%',
					matcher: Morebits.select2.matchers.optgroupFull,
					templateResult: Morebits.select2.highlightSearchMatches,
					language: {
						searching: Morebits.select2.queryInterceptor
					}
				})
				.change(Twinkle.warn.callback.change_subcategory);
	
			$('.select2-selection').keydown(Morebits.select2.autoStart).focus();
	
			mw.util.addCSS(
				// Increase height
				'.select2-container .select2-dropdown .select2-results > .select2-results__options { max-height: 350px; }' +
	
				// Reduce padding
				'.select2-results .select2-results__option { padding-top: 1px; padding-bottom: 1px; }' +
				'.select2-results .select2-results__group { padding-top: 1px; padding-bottom: 1px; } ' +
	
				// Adjust font size
				'.select2-container .select2-dropdown .select2-results { font-size: 13px; }' +
				'.select2-container .selection .select2-selection__rendered { font-size: 13px; }'
			);
		}
	};
	
	Twinkle.warn.callback.change_subcategory = function twinklewarnCallbackChangeSubcategory(e) {
		var main_group = e.target.form.main_group.value;
		var value = e.target.form.sub_group.value;
	
		// Tags that don't take a linked article, but something else (often a username).
		// The value of each tag is the label next to the input field
		var notLinkedArticle = {
			'uw-agf-sock': 'Tên người dùng tùy chọn của tài khoản khác (không có User:) ',
			'uw-bite': "Tên người dùng của người dùng 'bị cắn' (không có User:) ",
			'uw-socksuspect': 'Tên người dùng của chủ rối, nếu biết (không có User:) ',
			'uw-username': 'Tên người dùng vi phạm chính sách vì... ',
			'uw-aiv': 'Tên người dùng tùy chọn đã được báo cáo (không có User:) '
		};
	
		if (['singlenotice', 'singlewarn', 'singlecombined', 'kitchensink'].indexOf(main_group) !== -1) {
			if (notLinkedArticle[value]) {
				if (Twinkle.warn.prev_article === null) {
					Twinkle.warn.prev_article = e.target.form.article.value;
				}
				e.target.form.article.notArticle = true;
				e.target.form.article.value = '';
	
				// change form labels according to the warning selected
				Morebits.quickForm.setElementTooltipVisibility(e.target.form.article, false);
				Morebits.quickForm.overrideElementLabel(e.target.form.article, notLinkedArticle[value]);
			} else if (e.target.form.article.notArticle) {
				if (Twinkle.warn.prev_article !== null) {
					e.target.form.article.value = Twinkle.warn.prev_article;
					Twinkle.warn.prev_article = null;
				}
				e.target.form.article.notArticle = false;
				Morebits.quickForm.setElementTooltipVisibility(e.target.form.article, true);
				Morebits.quickForm.resetElementLabel(e.target.form.article);
			}
		}
	
		// add big red notice, warning users about how to use {{uw-[coi-]username}} appropriately
		$('#tw-warn-red-notice').remove();
		var $redWarning;
		if (value === 'uw-username') {
			$redWarning = $("<div style='color: red;' id='tw-warn-red-notice'>{{uw-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
				"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
				'{{uw-username}} should only be used in edge cases in order to engage in discussion with the user.</div>');
			$redWarning.insertAfter(Morebits.quickForm.getElementLabelObject(e.target.form.reasonGroup));
		} else if (value === 'uw-coi-username') {
			$redWarning = $("<div style='color: red;' id='tw-warn-red-notice'>{{uw-coi-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
				"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
				'{{uw-coi-username}} should only be used in edge cases in order to engage in discussion with the user.</div>');
			$redWarning.insertAfter(Morebits.quickForm.getElementLabelObject(e.target.form.reasonGroup));
		}
	};
	
	Twinkle.warn.callbacks = {
		getWarningWikitext: function(templateName, article, reason, isCustom) {
			var text = '{{subst:' + templateName;
	
			// add linked article for user warnings
			if (article) {
				// c&pmove has the source as the first parameter
				if (templateName === 'uw-c&pmove') {
					text += '|to=' + article;
				} else {
					text += '|1=' + article;
				}
			}
			if (reason && !isCustom) {
				// add extra message
				if (templateName === 'uw-csd' || templateName === 'uw-probation' ||
					templateName === 'uw-userspacenoindex' || templateName === 'uw-userpage') {
					text += "|3=''" + reason + "''";
				} else {
					text += "|2=''" + reason + "''";
				}
			}
			text += '}}';
	
			if (reason && isCustom) {
				// we assume that custom warnings lack a {{{2}}} parameter
				text += " ''" + reason + "''";
			}
	
			return text + ' ~~~~';
		},
		showPreview: function(form, templatename) {
			var input = Morebits.quickForm.getInputData(form);
			// Provided on autolevel, not otherwise
			templatename = templatename || input.sub_group;
			var linkedarticle = input.article;
			var templatetext;
	
			templatetext = Twinkle.warn.callbacks.getWarningWikitext(templatename, linkedarticle,
				input.reason, input.main_group === 'custom');
	
			form.previewer.beginRender(templatetext, 'User_talk:' + mw.config.get('wgRelevantUserName')); // Force wikitext/correct username
		},
		// Just a pass-through unless the autolevel option was selected
		preview: function(form) {
			if (form.main_group.value === 'autolevel') {
				// Always get a new, updated talkpage for autolevel processing
				var usertalk_page = new Morebits.wiki.page('User_talk:' + mw.config.get('wgRelevantUserName'), 'Đang tải các cảnh báo trước đó');
				usertalk_page.setFollowRedirect(true, false);
				// Will fail silently if the talk page is a cross-ns redirect,
				// removal of the preview box handled when loading the menu
				usertalk_page.load(function(pageobj) {
					Twinkle.warn.talkpageObj = pageobj; // Update talkpageObj
	
					var wikitext = pageobj.getPageText();
					// history not needed for autolevel
					var latest = Twinkle.warn.callbacks.dateProcessing(wikitext)[0];
					var params = {
						sub_group: form.sub_group.value,
						article: form.article.value,
						messageData: $(form.sub_group).find('option[value="' + $(form.sub_group).val() + '"]').data('messageData')
					};
					var template = Twinkle.warn.callbacks.autolevelParseWikitext(wikitext, params, latest)[0];
					Twinkle.warn.callbacks.showPreview(form, template);
	
					// If the templates have diverged, fake a change event
					// to reload the menu with the updated pageobj
					if (form.sub_group.value !== template) {
						var evt = document.createEvent('Event');
						evt.initEvent('change', true, true);
						form.main_group.dispatchEvent(evt);
					}
				});
			} else {
				Twinkle.warn.callbacks.showPreview(form);
			}
		},
		/**
		* Used in the main and autolevel loops to determine when to warn
		* about excessively recent, stale, or identical warnings.
		* @param {string} wikitext  The text of a user's talk page, from getPageText()
		* @returns {Object[]} - Array of objects: latest contains most recent
		* warning and date; history lists all prior warnings
		*/
		dateProcessing: function(wikitext) {
			var history_re = /<!--\s?Template:([uU]w-.*?)\s?-->.*?(\d{1,2}:\d{1,2}, \d{1,2} \w+ \d{4} \(UTC\))/g;
			var history = {};
			var latest = { date: new Morebits.date(0), type: '' };
			var current;
	
			while ((current = history_re.exec(wikitext)) !== null) {
				var template = current[1], current_date = new Morebits.date(current[2]);
				if (!(template in history) || history[template].isBefore(current_date)) {
					history[template] = current_date;
				}
				if (!latest.date.isAfter(current_date)) {
					latest.date = current_date;
					latest.type = template;
				}
			}
			return [latest, history];
		},
		/**
		* Main loop for deciding what the level should increment to. Most of
		* this is really just error catching and updating the subsequent data.
		* May produce up to two notices in a twinkle-warn-autolevel-messages div
		*
		* @param {string} wikitext  The text of a user's talk page, from getPageText() (required)
		* @param {Object} params  Params object: sub_group is the template (required);
		* article is the user-provided article (form.article) used to link ARV on recent level4 warnings;
		* messageData is only necessary if getting the full template, as it's
		* used to ensure a valid template of that level exists
		* @param {Object} latest  First element of the array returned from
		* dateProcessing. Provided here rather than processed within to avoid
		* repeated call to dateProcessing
		* @param {(Date|Morebits.date)} date  Date from which staleness is determined
		* @param {Morebits.status} statelem  Status element, only used for handling error in final execution
		*
		* @returns {Array} - Array that contains the full template and just the warning level
		*/
		autolevelParseWikitext: function(wikitext, params, latest, date, statelem) {
			var level; // undefined rather than '' means the isNaN below will return true
			if (/\d(?:im)?$/.test(latest.type)) { // level1-4im
				level = parseInt(latest.type.replace(/.*(\d)(?:im)?$/, '$1'), 10);
			} else if (latest.type) { // Non-numbered warning
				// Try to leverage existing categorization of
				// warnings, all but one are universally lowercased
				var loweredType = /uw-multipleIPs/i.test(latest.type) ? 'uw-multipleIPs' : latest.type.toLowerCase();
				// It would be nice to account for blocks, but in most
				// cases the hidden message is terminal, not the sig
				if (Twinkle.warn.messages.singlewarn[loweredType]) {
					level = 3;
				} else {
					level = 1; // singlenotice or not found
				}
			}
	
			var $autolevelMessage = $('<div/>', {'id': 'twinkle-warn-autolevel-message'});
	
			if (isNaN(level)) { // No prior warnings found, this is the first
				level = 1;
			} else if (level > 4 || level < 1) { // Shouldn't happen
				var message = 'Không thể xác định mức cảnh báo trước đó, vui lòng chọn mức cảnh báo theo cách thủ công.';
				if (statelem) {
					statelem.error(message);
				} else {
					alert(message);
				}
				return;
			} else {
				date = date || new Date();
				var autoTimeout = new Morebits.date(latest.date.getTime()).add(parseInt(Twinkle.getPref('autolevelStaleDays'), 10), 'days');
				if (autoTimeout.isAfter(date)) {
					if (level === 4) {
						level = 4;
						// Basically indicates whether we're in the final Main evaluation or not,
						// and thus whether we can continue or need to display the warning and link
						if (!statelem) {
							var $link = $('<a/>', {
								'href': '#',
								'text': 'click here to open the ARV tool.',
								'css': { 'fontWeight': 'bold' },
								'click': function() {
									Morebits.wiki.actionCompleted.redirect = null;
									Twinkle.warn.dialog.close();
									Twinkle.arv.callback(mw.config.get('wgRelevantUserName'));
									$('input[name=page]').val(params.article); // Target page
									$('input[value=final]').prop('checked', true); // Vandalism after final
								}
							});
							var statusNode = $('<div/>', {
								'text': mw.config.get('wgRelevantUserName') + ' gần đây đã nhận được cảnh báo cấp độ 4 (' + latest.type + ') vì vậy có thể tốt hơn nếu báo cáo người này với quản trị viên; ',
								'css': {'color': 'red' }
							});
							statusNode.append($link[0]);
							$autolevelMessage.append(statusNode);
						}
					} else { // Automatically increase severity
						level += 1;
					}
				} else { // Reset warning level if most-recent warning is too old
					level = 1;
				}
			}
	
			$autolevelMessage.prepend($('<div>Sẽ gửi một bản mẫu <span style="font-weight: bold;">cấp độ ' + level + '</span> template.</div>'));
			// Place after the stale and other-user-reverted (text-only) messages
			$('#twinkle-warn-autolevel-message').remove(); // clean slate
			$autolevelMessage.insertAfter($('#twinkle-warn-warning-messages'));
	
			var template = params.sub_group.replace(/(.*)\d$/, '$1');
			// Validate warning level, falling back to the uw-generic series.
			// Only a few items are missing a level, and in all but a handful
			// of cases, the uw-generic series is explicitly used elsewhere per WP:UTM.
			if (params.messageData && !params.messageData['level' + level]) {
				template = 'uw-generic';
			}
			template += level;
	
			return [template, level];
		},
		main: function(pageobj) {
			var text = pageobj.getPageText();
			var statelem = pageobj.getStatusElement();
			var params = pageobj.getCallbackParameters();
			var messageData = params.messageData;
	
			// JS somehow didn't get destructured assignment until ES6 so of course IE doesn't support it
			var warningHistory = Twinkle.warn.callbacks.dateProcessing(text);
			var latest = warningHistory[0];
			var history = warningHistory[1];
	
			var now = new Morebits.date(pageobj.getLoadTime());
	
			Twinkle.warn.talkpageObj = pageobj; // Update talkpageObj, just in case
			if (params.main_group === 'autolevel') {
				// [template, level]
				var templateAndLevel = Twinkle.warn.callbacks.autolevelParseWikitext(text, params, latest, now, statelem);
	
				// Only if there's a change from the prior display/load
				if (params.sub_group !== templateAndLevel[0] && !confirm('Will issue a {{' + templateAndLevel[0] + '}} bản mẫu cho người dùng, được chứ ?')) {
					statelem.error('bị hủy bỏ theo yêu cầu của người dùng');
					return;
				}
				// Update params now that we've selected a warning
				params.sub_group = templateAndLevel[0];
				messageData = params.messageData['level' + templateAndLevel[1]];
			} else if (params.sub_group in history) {
				if (new Morebits.date(history[params.sub_group]).add(1, 'day').isAfter(now)) {
					if (!confirm('An identical ' + params.sub_group + ' đã được phát hành trong 24 giờ qua.  \nBạn vẫn muốn thêm cảnh báo/thông báo này?')) {
						statelem.error('bị hủy bỏ theo yêu cầu của người dùng');
						return;
					}
				}
			}
	
			latest.date.add(1, 'minute'); // after long debate, one minute is max
	
			if (latest.date.isAfter(now)) {
				if (!confirm('A ' + latest.type + ' đã được cảnh báo vào phút trước.  \nBạn vẫn muốn thêm cảnh báo/thông báo này?')) {
					statelem.error('bị hủy bỏ theo yêu cầu của người dùng');
					return;
				}
			}
	
			var dateHeaderRegex = now.monthHeaderRegex(), dateHeaderRegexLast, dateHeaderRegexResult;
			while ((dateHeaderRegexLast = dateHeaderRegex.exec(text)) !== null) {
				dateHeaderRegexResult = dateHeaderRegexLast;
			}
			// If dateHeaderRegexResult is null then lastHeaderIndex is never checked. If it is not null but
			// \n== is not found, then the date header must be at the very start of the page. lastIndexOf
			// returns -1 in this case, so lastHeaderIndex gets set to 0 as desired.
			var lastHeaderIndex = text.lastIndexOf('\n==') + 1;
	
			if (text.length > 0) {
				text += '\n\n';
			}
	
			if (messageData.heading) {
				text += '== ' + messageData.heading + ' ==\n';
			} else if (!dateHeaderRegexResult || dateHeaderRegexResult.index !== lastHeaderIndex) {
				Morebits.status.info('Thông tin', 'Sẽ tạo một tiêu đề cấp 2 mới theo ngày, vì không có tiêu đề nào được tìm thấy trong tháng này');
				
				// format monthYear -- [Alphama]
				var time    = new Date();
				var month   = time.getUTCMonth() + 1;
				var year    = time.getUTCFullYear();
				stamp = '== Tháng ' + month + '/' + year + ' =='
				text += stamp + '\n';
			}
			text += Twinkle.warn.callbacks.getWarningWikitext(params.sub_group, params.article,
				params.reason, params.main_group === 'custom');
	
			if (Twinkle.getPref('showSharedIPNotice') && mw.util.isIPAddress(mw.config.get('wgTitle'))) {
				Morebits.status.info('Thông tin', 'Thêm thông báo IP được chia sẻ');
				text += '\n{{subst:Khuyên IP chung}}';
			}
	
			// build the edit summary
			// Function to handle generation of summary prefix for custom templates
			var customProcess = function(template) {
				template = template.split('|')[0];
				var prefix;
				switch (template.substr(-1)) {
					case '1':
						prefix = 'Lưu ý chung';
						break;
					case '2':
						prefix = 'Lưu ý';
						break;
					case '3':
						prefix = 'Cảnh báo';
						break;
					case '4':
						prefix = 'Cảnh báo cuối cùng';
						break;
					case 'm':
						if (template.substr(-3) === '4im') {
							prefix = 'Chỉ cảnh cáo';
							break;
						}
						// falls through
					default:
						prefix = 'Lưu ý';
						break;
				}
				return prefix + ': ' + Morebits.string.toUpperCaseFirstChar(messageData.label);
			};
	
			var summary;
			if (params.main_group === 'custom') {
				summary = customProcess(params.sub_group);
			} else {
				// Normalize kitchensink to the 1-4im style
				if (params.main_group === 'kitchensink' && !/^D+$/.test(params.sub_group)) {
					var sub = params.sub_group.substr(-1);
					if (sub === 'm') {
						sub = params.sub_group.substr(-3);
					}
					// Don't overwrite uw-3rr, technically unnecessary
					if (/\d/.test(sub)) {
						params.main_group = 'level' + sub;
					}
				}
				// singlet || level1-4im, no need to /^\D+$/.test(params.main_group)
				summary = messageData.summary || (messageData[params.main_group] && messageData[params.main_group].summary);
				// Not in Twinkle.warn.messages, assume custom template
				if (!summary) {
					summary = customProcess(params.sub_group);
				}
				if (messageData.suppressArticleInSummary !== true && params.article) {
					if (params.sub_group === 'uw-agf-sock' ||
							params.sub_group === 'uw-socksuspect' ||
							params.sub_group === 'uw-aiv') {  // these templates require a username
						summary += ' của [[:User:' + params.article + ']]';
					} else {
						summary += ' trong [[:' + params.article + ']]';
					}
				}
			}
			summary += '.';
	
			pageobj.setPageText(text);
			pageobj.setEditSummary(summary);
			pageobj.setChangeTags(Twinkle.changeTags);
			pageobj.setWatchlist(Twinkle.getPref('watchWarnings'));
			pageobj.save();
		}
	};
	
	Twinkle.warn.callback.evaluate = function twinklewarnCallbackEvaluate(e) {
		var userTalkPage = 'User_talk:' + mw.config.get('wgRelevantUserName');
	
		// reason, main_group, sub_group, article
		var params = Morebits.quickForm.getInputData(e.target);
	
		// Check that a reason was filled in if uw-username was selected
		if (params.sub_group === 'uw-username' && !params.article) {
			alert('Bạn phải cung cấp một lý do cho bản mẫu {{yêu cầu đổi tên}}.');
			return;
		}
	
		// The autolevel option will already know by now if a user talk page
		// is a cross-namespace redirect (via !!Twinkle.warn.talkpageObj), so
		// technically we could alert an error here, but the user will have
		// already ignored the bold red error above.  Moreover, they probably
		// *don't* want to actually issue a warning, so the error handling
		// after the form is submitted is probably preferable
	
		// Find the selected <option> element so we can fetch the data structure
		var $selectedEl = $(e.target.sub_group).find('option[value="' + $(e.target.sub_group).val() + '"]');
		params.messageData = $selectedEl.data('messageData');
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(e.target);
	
		Morebits.wiki.actionCompleted.redirect = userTalkPage;
		Morebits.wiki.actionCompleted.notice = 'Cảnh báo hoàn tất, tải lại trang thảo luận sau vài giây';
	
		var wikipedia_page = new Morebits.wiki.page(userTalkPage, 'Sửa đổi trang thảo luận của người dùng');
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.setFollowRedirect(true, false);
		wikipedia_page.load(Twinkle.warn.callbacks.main);
	};
	
	Twinkle.addInitCallback(Twinkle.warn, 'warn');
	})(jQuery);
	
	
	// </nowiki>
	