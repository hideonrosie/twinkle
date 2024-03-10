// <nowiki>


(function($) {


	/*
		****************************************
		*** twinklearv.js: ARV module
		****************************************
		* Mode of invocation:     Tab ("ARV") // Advance Reporting and Vetting
		* Active on:              Any page with relevant user name (userspace, contribs, etc.)
		*/
	
	Twinkle.arv = function twinklearv() {
		var username = mw.config.get('wgRelevantUserName');
		if (!username || username === mw.config.get('wgUserName')) {
			return;
		}
	
		var title = mw.util.isIPAddress(username) ? 'Báo cáo IP đến bảo quản viên' : 'Báo cáo thành viên đến bảo quản viên';
	
		Twinkle.addPortletLink(function() {
			Twinkle.arv.callback(username);
		}, 'Báo cáo phá hoại', 'tw-arv', title);
	};
	
	Twinkle.arv.callback = function (uid) {
		var Window = new Morebits.simpleWindow(600, 500);
		Window.setTitle('Báo cáo phá hoại'); // Backronym
		Window.setScriptName('Twinkle');
		// Window.addFooterLink('Hướng dẫn AIV', 'WP:GAIV');
		// Window.addFooterLink('Chỉ dẫn UAA', 'WP:UAAI');
		Window.addFooterLink('Về YCKDTK', 'WP:YCKDTK');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#arv');
	
		var form = new Morebits.quickForm(Twinkle.arv.callback.evaluate);
		var categories = form.append({
			type: 'select',
			name: 'category',
			label: 'Chọn dạng báo cáo: ',
			event: Twinkle.arv.callback.changeCategory
		});
		categories.append({
			type: 'option',
			label: 'Phá hoại',
			value: 'aiv'
		});
		categories.append({
			type: 'option',
			label: 'Tên thành viên',
			value: 'username',
			disabled: mw.util.isIPAddress(uid)
		});
		categories.append({
			type: 'option',
			label: 'Người chủ rối (WP:YCKDTK)',
			value: 'sock'
		});
		categories.append({
			type: 'option',
			label: 'Con rối (WP:YCKDTK)',
			value: 'puppet'
		});
		categories.append({
			type: 'option',
			label: 'Bút chiến',
			value: 'an3'
		});
		form.append({
			type: 'field',
			label: 'Work area',
			name: 'work_area'
		});
		form.append({ type: 'submit' });
		form.append({
			type: 'hidden',
			name: 'uid',
			value: uid
		});
	
		var result = form.render();
		Window.setContent(result);
		Window.display();
	
		// We must init the
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.category.dispatchEvent(evt);
	};
	
	Twinkle.arv.callback.changeCategory = function (e) {
		var value = e.target.value;
		var root = e.target.form;
		var old_area = Morebits.quickForm.getElements(root, 'work_area')[0];
		var work_area = null;
	
		switch (value) {
			case 'aiv':
			/* falls through */
			default:
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Báo cáo thành viên phá hoại',
					name: 'work_area'
				});
				work_area.append({
					type: 'input',
					name: 'page',
					label: 'Trang liên kết chính: ',
					tooltip: 'Để trống nếu không liên kết đến trang trong báo cáo',
					value: mw.util.getParamValue('vanarticle') || '',
					event: function(e) {
						var value = e.target.value;
						var root = e.target.form;
						if (value === '') {
							root.badid.disabled = root.goodid.disabled = true;
						} else {
							root.badid.disabled = false;
							root.goodid.disabled = root.badid.value === '';
						}
					}
				});
				work_area.append({
					type: 'input',
					name: 'badid',
					label: 'ID sửa đổi cho trang đích khi bị phá hoại: ',
					tooltip: 'Để trống nếu không có liên kết đến khác biệt',
					value: mw.util.getParamValue('vanarticlerevid') || '',
					disabled: !mw.util.getParamValue('vanarticle'),
					event: function(e) {
						var value = e.target.value;
						var root = e.target.form;
						root.goodid.disabled = value === '';
					}
				});
				work_area.append({
					type: 'input',
					name: 'goodid',
					label: 'ID sửa đổi tốt cuối cùng trước khi trang đích bị phá hoại: ',
					tooltip: 'Để trống cho liên kết khác biệt với bản sửa đổi trước đó',
					value: mw.util.getParamValue('vanarticlegoodrevid') || '',
					disabled: !mw.util.getParamValue('vanarticle') || mw.util.getParamValue('vanarticlerevid')
				});
				work_area.append({
					type: 'checkbox',
					name: 'arvtype',
					list: [
						{
							label: 'Phá hoại sau khi cảnh báo mức 4 được thiết lập',
							value: 'final'
						},
						{
							label: 'Phá hoại sau khi cấm gần đây (trong vòng 1 ngày)',
							value: 'postblock'
						},
						{
							label: 'Rõ ràng là một tài khoản chỉ phá hoại',
							value: 'vandalonly',
							disabled: mw.util.isIPAddress(root.uid.value)
						},
						{
							label: 'Tài khoản chỉ để quảng cáo',
							value: 'promoonly',
							disabled: mw.util.isIPAddress(root.uid.value)
						},
						{
							label: 'Tài khoản rõ ràng là một spambot hoặc là một tài khoản bị xâm phạm',
							value: 'spambot'
						}
					]
				});
				work_area.append({
					type: 'textarea',
					name: 'reason',
					label: 'Bình luận: '
				});
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
			case 'username':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Báo cáo vi phạm tên người dùng',
					name: 'work_area'
				});
				work_area.append({
					type: 'header',
					label: 'Các thể loại tên người dùng không phù hợp',
					tooltip: 'Wikipedia không cho phép tên người dùng gây hiểu lầm, quảng cáo, xúc phạm hoặc gây rối. Tên miền và địa chỉ email cũng bị cấm. Các tiêu chí này áp dụng cho cả tên người dùng và chữ ký. Tên người dùng không phù hợp ở một ngôn ngữ khác hoặc đại diện cho một tên không phù hợp với lỗi chính tả và thay thế, hoặc làm như vậy một cách gián tiếp hoặc ngụ ý, vẫn được coi là không phù hợp.'
				});
				work_area.append({
					type: 'checkbox',
					name: 'arvtype',
					list: [
						{
							label: 'Tên người dùng gây hiểu lầm',
							value: 'hiểu lầm',
							tooltip: 'Tên người dùng gây hiểu lầm ngụ ý những điều có liên quan, gây hiểu lầm về người đóng góp. Ví dụ: các điểm thực tế gây hiểu lầm, ấn tượng về thẩm quyền không đáng có hoặc tên người dùng tạo ấn tượng là tài khoản bot.'
						},
						{
							label: 'Tên người dùng mang tính quảng cáo',
							value: 'quảng cáo',
							tooltip: 'Tên người dùng mang tính quảng cáo là các quảng cáo cho một công ty, trang web hoặc nhóm. Vui lòng không báo cáo những tên này cho UAA (tên người dùng gây sự chú ý) trừ khi người dùng cũng đã thực hiện các chỉnh sửa quảng cáo liên quan đến tên.'
						},
						{
							label: 'Tên người dùng ngụ ý sử dụng chung',
							value: 'dùng chung',
							tooltip: 'Tên người dùng ngụ ý khả năng được sử dụng chung (tên của công ty hoặc nhóm hoặc tên của các bài đăng trong tổ chức) không được phép. Tên người dùng được chấp nhận nếu chứa tên công ty hoặc nhóm nhưng rõ ràng nhằm biểu thị một cá nhân, chẳng hạn như "Mark at WidgetsUSA", "Jack Smith at the XY Foundation", "WidgetFan87", v.v.'
						},
						{
							label: 'Tên người dùng mang tính phản cảm',
							value: 'phản cảm',
							tooltip: 'Tên người dùng mang tính phản cảm khiến việc chỉnh sửa trở nên khó khăn hoặc không thể.'
						},
						{
							label: 'Tên người dùng gây rối',
							value: 'phá hoại',
							tooltip: 'Những tên người dùng gây rối bao gồm việc troll hoàn toàn hoặc tấn công cá nhân, hoặc thể hiện ý định rõ ràng là phá hoại Wikipedia.'
						}
					]
				});
				work_area.append({
					type: 'textarea',
					name: 'reason',
					label: 'Bình luận:'
				});
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'puppet':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Báo cáo con rối đáng ngờ',
					name: 'work_area'
				});
				work_area.append(
					{
						type: 'input',
						name: 'sockmaster',
						label: 'Chủ rối',
						tooltip: 'Tên người dùng của chủ rối (sockmaster), không có tiền tố User:'
					}
				);
				work_area.append({
					type: 'textarea',
					label: 'Bằng chứng:',
					name: 'evidence',
					tooltip: 'Bằng chứng của bạn phải làm rõ rằng người dùng có thể đang lạm dụng nhiều tài khoản. Thông thường, điều này có nghĩa là khác biệt, lịch sử trang hoặc thông tin khác giải thích lý do tại sao người dùng a) giống nhau và b) gây rối. Đây chỉ là bằng chứng và thông tin cần thiết để đánh giá vấn đề. Tránh tất cả các cuộc thảo luận khác không phải là bằng chứng của con rối.'
				});
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Yêu cầu Kiểm định Tài khoản (CheckUser)',
							name: 'checkuser',
							tooltip: 'Kiểm định Tài khoản là một công cụ được sử dụng để thu thập bằng chứng kỹ thuật liên quan đến cáo buộc con rối. Nó sẽ không được sử dụng mà không có lý do chính đáng, mà bạn phải chứng minh rõ ràng. Đảm bảo bằng chứng của bạn giải thích lý do tại sao sử dụng công cụ này là phù hợp. Nó sẽ không được sử dụng để kết nối công khai tài khoản người dùng và địa chỉ IP.'
						},
						{
							label: 'Thông báo đến người dùng bị báo cáo vi phạm',
							name: 'notify',
							tooltip: 'Thông báo là không bắt buộc. Trong nhiều trường hợp, đặc biệt là đối với những người mắc bệnh con rối mãn tính, thông báo có thể phản tác dụng. Tuy nhiên, đặc biệt là trong các trường hợp ít nghiêm trọng liên quan đến những người dùng chưa được báo cáo trước đó, thông báo có thể làm cho các trường hợp trở nên công bằng hơn và cũng có vẻ công bằng hơn trong mắt bị cáo. Hãy sử dụng phán đoán của bạn để đưa ra quyết định hợp lý.'
						}
					]
				});
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
			case 'sock':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Báo cáo con rối bị nghi ngờ',
					name: 'work_area'
				});
				work_area.append(
					{
						type: 'dyninput',
						name: 'sockpuppet',
						label: 'Các con rối',
						sublabel: 'Sock: ',
						tooltip: 'Tên người dùng của con rối không có tiền tố User:',
						min: 2
					});
				work_area.append({
					type: 'textarea',
					label: 'Bằng chứng:',
					name: 'evidence',
					tooltip: 'Bằng chứng của bạn phải chỉ rõ rằng thành viên này có thể đang lạm dụng nhiều tài khoản. Bằng chứng có thể là liên kết đến khác biệt giữa các sửa đổi, lịch sử trang hoặc thông tin khác giải thích lý do tại sao người dùng a) giống nhau và b) gây rối. Đây chỉ là bằng chứng và thông tin cần thiết để đánh giá một vấn đề. Cần tránh tất cả các cuộc thảo luận khác không phải là bằng chứng của việc lạm dụng rối.'
				});
				work_area.append({
					type: 'checkbox',
					list: [ {
						label: 'Yêu cầu kiểm định tài khoản (CheckUser)',
						name: 'checkuser',
						tooltip: 'Kiểm định Tài khoản là một công cụ được sử dụng để thu thập bằng chứng kỹ thuật liên quan đến cáo buộc lạm dụng rối. Công cụ sẽ không được sử dụng mà không có lý do chính đáng, vì vậy bạn phải chứng minh rõ ràng. Đảm bảo bằng chứng của bạn giải thích lý do tại sao sử dụng công cụ này là phù hợp. Công cụ sẽ không được sử dụng để công khai mối quan hệ tài khoản thành viên và địa chỉ IP.'
					}, {
						label: 'Thông báo cho người dùng bị báo cáo vi phạm',
						name: 'notify',
						tooltip: 'Thông báo là không bắt buộc. Trong nhiều trường hợp, đặc biệt là đối với rối phá hoại dai dẳng thông báo có thể phản tác dụng. Tuy nhiên, trong các trường hợp ít nghiêm trọng liên quan đến những thành viên chưa được báo cáo trước đó, thông báo có thể làm cho các trường hợp trở nên công bằng hơn và cũng có vẻ công bằng hơn trong mắt thành viên. Hãy sử dụng phán đoán của bạn để đưa ra quyết định.'
					} ]
				});
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
			case 'an3':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Báo cáo bút chiến',
					name: 'work_area'
				});
				work_area.append({
					type: 'input',
					name: 'page',
					label: 'Trang',
					tooltip: 'Trang đang được báo cáo'
				});
				work_area.append({
					type: 'button',
					name: 'load',
					label: 'Tải',
					event: function(e) {
						var root = e.target.form;
	
						var date = new Morebits.date().subtract(48, 'hours'); // all since 48 hours
	
						// Run for each AN3 field
						var getAN3Entries = function(field, rvuser, titles) {
							var $field = $(root).find('[name=' + field + ']');
							$field.find('.entry').remove();
	
							new mw.Api().get({
								action: 'query',
								prop: 'revisions',
								format: 'json',
								rvprop: 'sha1|ids|timestamp|parsedcomment|comment',
								rvlimit: 500, // intentionally limited
								rvend: date.toISOString(),
								rvuser: rvuser,
								indexpageids: true,
								redirects: true,
								titles: titles
							}).done(function(data) {
								var pageid = data.query.pageids[0];
								var page = data.query.pages[pageid];
								if (!page.revisions) {
									$('<span class="entry">Không tìm thấy</span>').appendTo($field);
									return;
								}
								for (var i = 0; i < page.revisions.length; ++i) {
									var rev = page.revisions[i];
									var $entry = $('<div/>', {
										'class': 'entry'
									});
									var $input = $('<input/>', {
										'type': 'checkbox',
										'name': 's_' + field,
										'value': rev.revid
									});
									$input.data('revinfo', rev);
									$input.appendTo($entry);
									var comment = '<span>';
									// revdel/os
									if (typeof rev.commenthidden === 'string') {
										comment += '(ẩn bình luận)';
									} else {
										comment += '"' + rev.parsedcomment + '"';
									}
									comment += ' at <a href="' + mw.config.get('wgScript') + '?diff=' + rev.revid + '">' + new Morebits.date(rev.timestamp).calendar() + '</a></span>';
									$entry.append(comment).appendTo($field);
								}
	
								// add free form input for resolves
								if (field === 'resolves') {
									var $free_entry = $('<div/>', {
										'class': 'entry'
									});
									var $free_input = $('<input/>', {
										'type': 'text',
										'name': 's_resolves_free'
									});
	
									var $free_label = $('<label/>', {
										'for': 's_resolves_free',
										'html': 'Liên kết URL đến khác biệt sửa đổi với các cuộc thảo luận bổ sung: '
									});
									$free_entry.append($free_label).append($free_input).appendTo($field);
								}
							}).fail(function() {
								$('<span class="entry">API thất bại, tải lại trang và thử lại</span>').appendTo($field);
							});
						};
	
						// warnings
						var uid = root.uid.value;
						getAN3Entries('warnings', mw.config.get('wgUserName'), 'Thảo luận Thành viên:' + uid);
	
						// diffs and resolves require a valid page
						var page = root.page.value;
						if (page) {
							// diffs
							getAN3Entries('diffs', uid, page);
	
							// resolutions
							var t = new mw.Title(page);
							var talk_page = t.getTalkPage().getPrefixedText();
							getAN3Entries('resolves', mw.config.get('wgUserName'), talk_page);
						} else {
							$(root).find('[name=diffs]').find('.entry').remove();
							$(root).find('[name=resolves]').find('.entry').remove();
						}
					}
				});
				work_area.append({
					type: 'field',
					name: 'diffs',
					label: 'Các lần lùi sửa của thành viên (trong vòng 48 giờ)',
					tooltip: 'Chọn các sửa đổi mà bạn cho rằng đây là hành vi bút chiến'
				});
				work_area.append({
					type: 'field',
					name: 'warnings',
					label: 'Cảnh báo',
					tooltip: 'Bạn phải cảnh báo thành viên trước khi báo cáo'
				});
				work_area.append({
					type: 'field',
					name: 'resolves',
					label: 'Đề nghị giải quyết',
					tooltip: 'Bạn nên cố gắng giải quyết vấn đề trên trang thảo luận trước'
				});
	
				work_area.append({
					type: 'textarea',
					label: 'Bình luận:',
					name: 'comment'
				});
	
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
		}
	};
	
	Twinkle.arv.callback.evaluate = function(e) {
		var form = e.target;
		var reason = '';
		var comment = '';
		if (form.reason) {
			comment = form.reason.value;
		}
		var uid = form.uid.value;
	
		var types;
		switch (form.category.value) {
	
			// Report user for vandalism
			case 'aiv':
				/* falls through */
			default:
				types = form.getChecked('arvtype');
				if (!types.length && comment === '') {
					alert('Bạn phải nêu một vài lý do');
					return;
				}
	
				types = types.map(function(v) {
					switch (v) {
						case 'final':
							return 'phá hoại sau cảnh báo cuối cùng';
						case 'postblock':
							return 'phá hoại sau khi bị cấm gần đây';
						case 'vandalonly':
							return 'các hành động rõ ràng chỉ ra một tài khoản chỉ phá hoại';
						case 'promoonly':
							return 'tài khoản chỉ được sử dụng cho các mục đích quảng cáo';
						case 'spambot':
							return 'tài khoản rõ ràng là một spambot hoặc một tài khoản bị xâm phạm';
						default:
							return 'không rõ lý do';
					}
				}).join('; ');
	
	
				if (form.page.value !== '') {
					// Allow links to redirects, files, and categories
					reason = 'Ở bài viết {{No redirect|:' + form.page.value + '}}';
	
					if (form.badid.value !== '') {
						reason += ' ({{diff|' + form.page.value + '|' + form.badid.value + '|' + form.goodid.value + '|diff}})';
					}
					reason += ':';
				}
	
				if (types) {
					reason += ' ' + types;
				}
				if (comment !== '') {
					reason += (reason === '' ? '' : '. ') + comment;
				}
				reason = reason.trim();
				if (!/[.?!;]$/.test(reason)) {
					reason += '.';
				}
				reason += ' ~~~~';
				reason = reason.replace(/\r?\n/g, '\n*:');  // indent newlines
	
				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);
	
				Morebits.wiki.actionCompleted.redirect = 'Wikipedia:Tin nhắn cho bảo quản viên';
				Morebits.wiki.actionCompleted.notice = 'Báo cáo thành công';
	
				var aivPage = new Morebits.wiki.page('Wikipedia:Tin nhắn cho bảo quản viên', 'Tiến hành báo cáo');
				// aivPage.setPageSection(1); -- 1 = lấy phần đầu tiên của trang, tạm che
				aivPage.setFollowRedirect(true);
	
				aivPage.load(function() {
					var text = aivPage.getPageText();
					var $aivLink = '<a target="_blank" href="/wiki/WP:AIV">WP:AIV</a>';
	
					// check if user has already been reported
					if (new RegExp('\\{\\{\\s*(?:(?:[Ii][Pp])?[Vv]andal|[Uu]serlinks)\\s*\\|\\s*(?:1=)?\\s*' + Morebits.string.escapeRegExp(uid) + '\\s*\\}\\}').test(text)) {
						aivPage.getStatusElement().error('Báo cáo đã có, sẽ không thêm báo cáo mới');
						Morebits.status.printUserText(reason, 'Bình luận bạn đã nhập được cung cấp bên dưới, trong trường hợp bạn muốn đăng chúng theo cách thủ công trong báo cáo hiện có cho người dùng này tại ' + $aivLink + ':');
						return;
					}
	
					// then check for any bot reports
					var tb2Page = new Morebits.wiki.page('Wikipedia:Tin nhắn cho bảo quản viên', 'Kiểm tra báo cáo bot');
					tb2Page.load(function() {
						var tb2Text = tb2Page.getPageText();
						var tb2statelem = tb2Page.getStatusElement();
	
						if (new RegExp('\\{\\{\\s*(?:(?:[Ii][Pp])?[Vv]andal|[Uu]serlinks)\\s*\\|\\s*(?:1=)?\\s*' + Morebits.string.escapeRegExp(uid) + '\\s*\\}\\}').test(tb2Text)) {
							if (confirm('Thành viên ' + uid + ' đã được báo cáo bởi một bot. Bạn có muốn thực hiện báo cáo này không?')) {
								tb2statelem.info('Đã tiếp tục mặc dù có báo cáo từ bot');
							} else {
								tb2statelem.error('Đã có bot báo cáo, tác vụ bị hủy bỏ.');
								Morebits.status.printUserText(reason, 'Bình luận bạn đã nhập được cung cấp bên dưới, trong trường hợp bạn muốn đăng chúng theo cách thủ công tại ' + $aivLink + ':');
								return;
							}
						} else {
							tb2statelem.info('Không có báo cáo bot xung đột');
						}
	
						aivPage.getStatusElement().status('Thêm báo cáo mới...');
						aivPage.setEditSummary('Báo cáo [[Special:Contributions/' + uid + '|' + uid + ']].');
						aivPage.setChangeTags(Twinkle.changeTags);
						aivPage.setAppendText('\n== Báo cáo phá hoại ==\n*{{' + (mw.util.isIPAddress(uid) ? 'IPvandal' : 'vandal') + '|' + (/=/.test(uid) ? '1=' : '') + uid + '}} &ndash; ' + reason);
						aivPage.append();
					});
				});
				break;
	
			// Report inappropriate username
			case 'username':
				types = form.getChecked('arvtype').map(Morebits.string.toLowerCaseFirstChar);
	
				var hasShared = types.indexOf('dùng chung') > -1;
				if (hasShared) {
					types.splice(types.indexOf('dùng chung'), 1);
				}
	
				if (types.length <= 2) {
					types = types.join(' and ');
				} else {
					types = [ types.slice(0, -1).join(', '), types.slice(-1) ].join(' and ');
				}
				var article = 'một';
				if (/[aeiouwyh]/.test(types[0] || '')) { // non 100% correct, but whatever, including 'h' for Cockney
					article = 'một';
				}
				reason = '*{{user-uaa|1=' + uid + '}} &ndash; ';
				if (types.length || hasShared) {
					reason += 'Vi phạm quy định về tên người dùng ' + article + ' ' + ' người dùng có tên mang tính ' + types + 
						(hasShared ? ' có nghĩa là sử dụng chung. ' : '. ');
				}
				if (comment !== '') {
					reason += Morebits.string.toUpperCaseFirstChar(comment) + '. ';
				}
				reason += '~~~~';
				reason = reason.replace(/\r?\n/g, '\n*:');  // indent newlines
	
				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);
	
				Morebits.wiki.actionCompleted.redirect = 'Wikipedia:Tin nhắn cho bảo quản viên';
				Morebits.wiki.actionCompleted.notice = 'Báo cáo thành công';
	
				var uaaPage = new Morebits.wiki.page('Wikipedia:Tin nhắn cho bảo quản viên', 'Tiến hành yêu cầu');
				uaaPage.setFollowRedirect(true);
	
				uaaPage.load(function() {
					var text = uaaPage.getPageText();
	
					// check if user has already been reported
					if (new RegExp('\\{\\{\\s*user-uaa\\s*\\|\\s*(1\\s*=\\s*)?' + Morebits.string.escapeRegExp(uid) + '\\s*(\\||\\})').test(text)) {
						uaaPage.getStatusElement().error('Thành viên đã được báo cáo.');
						var $uaaLink = '<a target="_blank" href="/wiki/WP:UAA">WP:UAA</a>';
						Morebits.status.printUserText(reason, 'Bình luận bạn đã nhập được cung cấp bên dưới, trong trường hợp bạn muốn đăng chúng theo cách thủ công trong báo cáo hiện có cho người dùng này tại ' + $uaaLink + ':');
						return;
					}
					uaaPage.getStatusElement().status('Thêm báo cáo mới...');
					uaaPage.setEditSummary('Báo cáo [[Special:Contributions/' + uid + '|' + uid + ']].');
					uaaPage.setChangeTags(Twinkle.changeTags);
					uaaPage.setPageText(text + '\n' + reason);
					uaaPage.save();
				});
				break;
	
			// WP:SPI
			case 'sock':
				/* falls through */
			case 'puppet':
				var sockParameters = {
					evidence: form.evidence.value.trim(),
					checkuser: form.checkuser.checked,
					notify: form.notify.checked
				};
	
				var puppetReport = form.category.value === 'puppet';
				if (puppetReport && !form.sockmaster.value.trim()) {
					alert('Bạn chưa nhập tài khoản chủ rối cho con rối này. Bạn cũng có thể xem xét báo cáo tài khoản này như một chủ rối.');
					return;
				} else if (!puppetReport && !form.sockpuppet[0].value.trim()) {
					alert('Bạn chưa nhập bất kỳ (các) tài khoản con rối nào cho chủ rối này. Bạn cũng có thể xem xét báo cáo tài khoản này dưới dạng tài khoản con rối.');
					return;
				}
	
				sockParameters.uid = puppetReport ? form.sockmaster.value.trim() : uid;
				sockParameters.sockpuppets = puppetReport ? [uid] : $.map($('input:text[name=sockpuppet]', form), function(o) {
					return $(o).val() || null;
				});
	
				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);
				Twinkle.arv.processSock(sockParameters);
				break;
	
			case 'an3':
				var diffs = $.map($('input:checkbox[name=s_diffs]:checked', form), function(o) {
					return $(o).data('revinfo');
				});
	
				if (diffs.length < 3 && !confirm('Bạn đã chọn ít hơn ba sửa đổi vi phạm. Bạn có muốn thực hiện báo cáo này không?')) {
					return;
				}
	
				var warnings = $.map($('input:checkbox[name=s_warnings]:checked', form), function(o) {
					return $(o).data('revinfo');
				});
	
				if (!warnings.length && !confirm('Bạn chưa chọn bất kỳ sửa đổi nào mà bạn đã cảnh báo người vi phạm. Bạn có muốn thực hiện báo cáo này không?')) {
					return;
				}
	
				var resolves = $.map($('input:checkbox[name=s_resolves]:checked', form), function(o) {
					return $(o).data('revinfo');
				});
				var free_resolves = $('input[name=s_resolves_free]').val();
	
				var an3_next = function(free_resolves) {
					if (!resolves.length && !free_resolves && !confirm('Bạn chưa chọn bất kỳ sửa đổi nào mà bạn đã cố gắng giải quyết vấn đề. Bạn có muốn thực hiện báo cáo này không?')) {
						return;
					}
	
					var an3Parameters = {
						'uid': uid,
						'page': form.page.value.trim(),
						'comment': form.comment.value.trim(),
						'diffs': diffs,
						'warnings': warnings,
						'resolves': resolves,
						'free_resolves': free_resolves
					};
	
					Morebits.simpleWindow.setButtonsEnabled(false);
					Morebits.status.init(form);
					Twinkle.arv.processAN3(an3Parameters);
				};
	
				if (free_resolves) {
					var query;
					var diff, oldid;
					var specialDiff = /Special:Diff\/(\d+)(?:\/(\S+))?/i.exec(free_resolves);
					if (specialDiff) {
						if (specialDiff[2]) {
							oldid = specialDiff[1];
							diff = specialDiff[2];
						} else {
							diff = specialDiff[1];
						}
					} else {
						diff = mw.util.getParamValue('diff', free_resolves);
						oldid = mw.util.getParamValue('oldid', free_resolves);
					}
					var title = mw.util.getParamValue('title', free_resolves);
					var diffNum = /^\d+$/.test(diff); // used repeatedly
	
					// rvdiffto in prop=revisions is deprecated, but action=compare doesn't return
					// timestamps ([[phab:T247686]]) so we can't rely on it unless necessary.
					// Likewise, we can't rely on a meaningful comment for diff=cur.
					// Additionally, links like Special:Diff/123/next, Special:Diff/123/456, or ?diff=next&oldid=123
					// would each require making use of rvdir=newer in the revisions API.
					// That requires a title parameter, so we have to use compare instead of revisions.
					if (oldid && (diff === 'cur' || (!title && (diff === 'next' || diffNum)))) {
						query = {
							action: 'compare',
							fromrev: oldid,
							prop: 'ids|title',
							format: 'json'
						};
						if (diffNum) {
							query.torev = diff;
						} else {
							query.torelative = diff;
						}
					} else {
						query = {
							action: 'query',
							prop: 'revisions',
							rvprop: 'ids|timestamp|comment',
							format: 'json',
							indexpageids: true
						};
	
						if (diff && oldid) {
							if (diff === 'prev') {
								query.revids = oldid;
							} else {
								query.titles = title;
								query.rvdir = 'newer';
								query.rvstartid = oldid;
	
								if (diff === 'next' && title) {
									query.rvlimit = 2;
								} else if (diffNum) {
									// Diffs may or may not be consecutive, no limit
									query.rvendid = diff;
								}
							}
						} else {
							// diff=next|prev|cur with no oldid
							// Implies title= exists otherwise it's not a valid diff link (well, it is, but to the Main Page)
							if (diff && /^\D+$/.test(diff)) {
								query.titles = title;
							} else {
								query.revids = diff || oldid;
							}
						}
					}
	
					new mw.Api().get(query).done(function(data) {
						var page;
						if (data.compare && data.compare.fromtitle === data.compare.totitle) {
							page = data;
						} else if (data.query) {
							var pageid = data.query.pageids[0];
							page = data.query.pages[pageid];
						} else {
							return;
						}
						an3_next(page);
					}).fail(function(data) {
						console.log('API thất bại :(', data); // eslint-disable-line no-console
					});
				} else {
					an3_next();
				}
				break;
		}
	};
	
	Twinkle.arv.processSock = function(params) {
		Morebits.wiki.addCheckpoint(); // prevent notification events from causing an erronous "action completed"
	
		// Thông báo cho tất cả tài khoản bị nghi ngờ là rối
		if (params.notify && params.sockpuppets.length > 0) {
	
			var notifyEditSummary = 'Thông báo về việc nghi ngờ là rối.';
			var notifyText = '\n\n{{subst:socksuspectnotice|1=' + params.uid + '}} ~~~~';
	
			// notify user's master account
			var masterTalkPage = new Morebits.wiki.page('Thảo luận Thành viên:' + params.uid, 'Thông báo: Có nghi ngờ rằng bạn đang lạm dụng nhiều tài khoản');
			masterTalkPage.setFollowRedirect(true);
			masterTalkPage.setEditSummary(notifyEditSummary);
			masterTalkPage.setChangeTags(Twinkle.changeTags);
			masterTalkPage.setAppendText(notifyText);
			masterTalkPage.append();
	
			var statusIndicator = new Morebits.status('Thông báo các con rối bị nghi ngờ', '0%');
			var total = params.sockpuppets.length;
			var current = 0;
	
			// display status of notifications as they progress
			var onSuccess = function(sockTalkPage) {
				var now = parseInt(100 * ++current / total, 10) + '%';
				statusIndicator.update(now);
				sockTalkPage.getStatusElement().unlink();
				if (current >= total) {
					statusIndicator.info(now + ' (hoàn thành)');
				}
			};
	
			var socks = params.sockpuppets;
	
			// Thông báo cho từng tài khoản
			for (var i = 0; i < socks.length; ++i) {
				var sockTalkPage = new Morebits.wiki.page('Thảo luận Thành viên:' + socks[i], 'Thông báo cho ' + socks[i]);
				sockTalkPage.setFollowRedirect(true);
				sockTalkPage.setEditSummary(notifyEditSummary);
				sockTalkPage.setChangeTags(Twinkle.changeTags);
				sockTalkPage.setAppendText(notifyText);
				sockTalkPage.append(onSuccess);
			}
		}
	
		// prepare the SPI report
		var text = '\n\n{{subst:Mẫu YCKDTK|socksraw=' +
			params.sockpuppets.map(function(v) {
				return '* {{' + (mw.util.isIPAddress(v) ? 'checkip' : 'checkuser') + '|1=' + v + '}}';
			}).join('\n') + '\n|evidence=' + params.evidence + ' \n';
	
		if (params.checkuser) {
			text += '|checkuser=yes';
		}
		text += '}}';
	
		var reportpage = 'Wikipedia:Yêu cầu kiểm định tài khoản/' + params.uid;
	
		Morebits.wiki.actionCompleted.redirect = reportpage;
		Morebits.wiki.actionCompleted.notice = 'Báo cáo hoàn thành';
	
		var spiPage = new Morebits.wiki.page(reportpage, 'Đang lấy trang thảo luận');
		spiPage.setFollowRedirect(true);
		spiPage.setEditSummary('Thêm báo cáo mới cho [[Đặc biệt:Đóng góp/' + params.uid + '|' + params.uid + ']].');
		spiPage.setChangeTags(Twinkle.changeTags);
		spiPage.setAppendText(text);
		switch (Twinkle.getPref('spiWatchReport')) {
			case 'yes':
				spiPage.setWatchlist(true);
				break;
			case 'no':
				spiPage.setWatchlistFromPreferences(false);
				break;
			default:
				spiPage.setWatchlistFromPreferences(true);
				break;
		}
		spiPage.append();
	
		Morebits.wiki.removeCheckpoint();  // all page updates have been started
	};
	
	Twinkle.arv.processAN3 = function(params) {
		// prepare the AN3 report
		var minid;
		for (var i = 0; i < params.diffs.length; ++i) {
			if (params.diffs[i].parentid && (!minid || params.diffs[i].parentid < minid)) {
				minid = params.diffs[i].parentid;
			}
		}
	
		new mw.Api().get({
			action: 'query',
			prop: 'revisions',
			format: 'json',
			rvprop: 'sha1|ids|timestamp|comment',
			rvlimit: 100, // intentionally limited
			rvstartid: minid,
			rvexcludeuser: params.uid,
			indexpageids: true,
			redirects: true,
			titles: params.page
		}).done(function(data) {
			Morebits.wiki.addCheckpoint(); // prevent notification events from causing an erronous "action completed"
	
			// In case an edit summary was revdel'd
			var hasHiddenComment = function(rev) {
				if (!rev.comment && typeof rev.commenthidden === 'string') {
					return '(ẩn bình luận)';
				}
				return '"' + rev.comment + '"';
	
			};
	
			var orig;
			if (data.length) {
				var sha1 = data[0].sha1;
				for (var i = 1; i < data.length; ++i) {
					if (data[i].sha1 === sha1) {
						orig = data[i];
						break;
					}
				}
	
				if (!orig) {
					orig = data[0];
				}
			}
	
			var origtext = '';
			if (orig) {
				origtext = '{{diff2|' + orig.revid + '|' + orig.timestamp + '}} ' + hasHiddenComment(orig);
			}
	
			var grouped_diffs = {};
	
			var parentid, lastid;
			for (var j = 0; j < params.diffs.length; ++j) {
				var cur = params.diffs[j];
				if ((cur.revid && cur.revid !== parentid) || lastid === null) {
					lastid = cur.revid;
					grouped_diffs[lastid] = [];
				}
				parentid = cur.parentid;
				grouped_diffs[lastid].push(cur);
			}
	
			var difftext = $.map(grouped_diffs, function(sub) {
				var ret = '';
				if (sub.length >= 2) {
					var last = sub[0];
					var first = sub.slice(-1)[0];
					var label = 'Các sửa đổi liên tiếp được thực hiện từ ' + new Morebits.date(first.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC) to ' + new Morebits.date(last.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC)';
					ret = '# {{diff|oldid=' + first.parentid + '|diff=' + last.revid + '|label=' + label + '}}\n';
				}
				ret += sub.reverse().map(function(v) {
					return (sub.length >= 2 ? '#' : '') + '# {{diff2|' + v.revid + '|' + new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC)}} ' + hasHiddenComment(v);
				}).join('\n');
				return ret;
			}).reverse().join('\n');
			var warningtext = params.warnings.reverse().map(function(v) {
				return '# ' + ' {{diff2|' + v.revid + '|' + new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC)}} ' + hasHiddenComment(v);
			}).join('\n');
			var resolvetext = params.resolves.reverse().map(function(v) {
				return '# ' + ' {{diff2|' + v.revid + '|' + new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC)}} ' + hasHiddenComment(v);
			}).join('\n');
	
			if (params.free_resolves) {
				var page = params.free_resolves;
				if (page.compare) {
					resolvetext += '\n# ' + ' {{diff|oldid=' + page.compare.fromrevid + '|diff=' + page.compare.torevid + '|label=Các sửa đổi liên tiếp vào lúc ' + page.compare.totitle + '}}';
				} else if (page.revisions) {
					var revCount = page.revisions.length;
					var rev;
					if (revCount < 3) { // diff=prev or next
						rev = revCount === 1 ? page.revisions[0] : page.revisions[1];
						resolvetext += '\n# ' + ' {{diff2|' + rev.revid + '|' + new Morebits.date(rev.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC) on ' + page.title + '}} ' + hasHiddenComment(rev);
					} else { // diff and oldid are nonconsecutive
						rev = page.revisions[0];
						var revLatest = page.revisions[revCount - 1];
						var label = 'Các sửa đổi liên tiếp được thực hiện từ ' + new Morebits.date(rev.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC) to ' + new Morebits.date(revLatest.timestamp).format('HH:mm, D MMMM YYYY', 'utc') + ' (UTC) on ' + page.title;
						resolvetext += '\n# {{diff|oldid=' + rev.revid + '|diff=' + revLatest.revid + '|label=' + label + '}}\n';
					}
				}
			}
	
			var comment = params.comment.replace(/~*$/g, '').trim();
	
			if (comment) {
				comment += ' ~~~~';
			}
	
			var text = '\n\n' + '{{subst:AN3 report|diffs=' + difftext + '|warnings=' + warningtext + '|resolves=' + resolvetext + '|pagename=' + params.page + '|orig=' + origtext + '|comment=' + comment + '|uid=' + params.uid + '}}';
	
			var reportpage = 'Wikipedia:Tin nhắn cho bảo quản viên';
	
			Morebits.wiki.actionCompleted.redirect = reportpage;
			Morebits.wiki.actionCompleted.notice = 'Báo cáo thành công';
	
			var an3Page = new Morebits.wiki.page(reportpage, 'Truy xuất trang thảo luận');
			an3Page.setFollowRedirect(true);
			an3Page.setEditSummary('Thêm báo cáo mới cho [[Special:Contributions/' + params.uid + '|' + params.uid + ']].');
			an3Page.setChangeTags(Twinkle.changeTags);
			an3Page.setAppendText(text);
			an3Page.append();
	
			// notify user
	
			var notifyText = '\n\n{{subst:an3-notice|1=' + mw.util.wikiUrlencode(params.uid) + '|auto=1}} ~~~~';
	
			var talkPage = new Morebits.wiki.page('User talk:' + params.uid, 'Thông báo cho người tham gia bút chiến');
			talkPage.setFollowRedirect(true);
			talkPage.setEditSummary('Thông báo về việc thảo luận về vấn đề bút chiến tại Tin nhắn cho bảo quản viên.');
			talkPage.setChangeTags(Twinkle.changeTags);
			talkPage.setAppendText(notifyText);
			talkPage.append();
			Morebits.wiki.removeCheckpoint();  // all page updates have been started
		}).fail(function(data) {
			console.log('API thất bại :(', data); // eslint-disable-line no-console
		});
	};
	
	Twinkle.addInitCallback(Twinkle.arv, 'arv');
	})(jQuery);
	
	
	// </nowiki>