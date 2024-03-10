// <nowiki>

(function($) {


	/*
	 ****************************************
	 *** friendlytag.js: Tag module
	 ****************************************
	 * Mode of invocation:     Tab ("Tag")
	 * Active on:              Existing articles and drafts; file pages with a corresponding file
	 *                         which is local (not on Commons); all redirects
	 */
	
	Twinkle.tag = function friendlytag() {
		// redirect tagging
		if (Morebits.wiki.isPageRedirect()) {
			Twinkle.tag.mode = 'redirect';
			Twinkle.addPortletLink(Twinkle.tag.callback, 'Gán nhãn (thẻ)', 'friendly-tag', 'Đổi hướng nhãn');
		// file tagging
		} else if (mw.config.get('wgNamespaceNumber') === 6 && !document.getElementById('mw-sharedupload') && document.getElementById('mw-imagepage-section-filehistory')) {
			Twinkle.tag.mode = 'file';
			Twinkle.addPortletLink(Twinkle.tag.callback, 'Gán nhãn (thẻ)', 'friendly-tag', 'Thêm nhãn bảo trì vào tập tin ');
		// article/draft article tagging
		} else if ([0, 118].indexOf(mw.config.get('wgNamespaceNumber')) !== -1 && mw.config.get('wgCurRevisionId')) {
			Twinkle.tag.mode = 'article';
			// Can't remove tags when not viewing current version
			Twinkle.tag.canRemove = (mw.config.get('wgCurRevisionId') === mw.config.get('wgRevisionId')) &&
				// Disabled on latest diff because the diff slider could be used to slide
				// away from the latest diff without causing the script to reload
				!mw.config.get('wgDiffNewId');
			Twinkle.addPortletLink(Twinkle.tag.callback, 'Gán nhãn (thẻ)', 'friendly-tag', 'Thêm hoặc xóa nhãn bảo trì bài viết');
		}
	};
	
	Twinkle.tag.checkedTags = [];
	
	Twinkle.tag.callback = function friendlytagCallback() {
		var Window = new Morebits.simpleWindow(630, Twinkle.tag.mode === 'article' ? 500 : 400);
		Window.setScriptName('Twinkle');
		// anyone got a good policy/guideline/info page/instructional page link??
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#gán_nhãn');
	
		var form = new Morebits.quickForm(Twinkle.tag.callback.evaluate);
	
		form.append({
			type: 'input',
			label: 'Lọc danh sách nhãn: ',
			name: 'quickfilter',
			size: '30px',
			event: function twinkletagquickfilter() {
				// flush the DOM of all existing underline spans
				$allCheckboxDivs.find('.search-hit').each(function(i, e) {
					var label_element = e.parentElement;
					// This would convert <label>Hello <span class=search-hit>wo</span>rld</label>
					// to <label>Hello world</label>
					label_element.innerHTML = label_element.textContent;
				});
	
				if (this.value) {
					$allCheckboxDivs.hide();
					$allHeaders.hide();
					var searchString = this.value;
					var searchRegex = new RegExp(mw.util.escapeRegExp(searchString), 'i');
	
					$allCheckboxDivs.find('label').each(function () {
						var label_text = this.textContent;
						var searchHit = searchRegex.exec(label_text);
						if (searchHit) {
							var range = document.createRange();
							var textnode = this.childNodes[0];
							range.selectNodeContents(textnode);
							range.setStart(textnode, searchHit.index);
							range.setEnd(textnode, searchHit.index + searchString.length);
							var underline_span = $('<span>').addClass('search-hit').css('text-decoration', 'underline')[0];
							range.surroundContents(underline_span);
							this.parentElement.style.display = 'block'; // show
						}
					});
				} else {
					$allCheckboxDivs.show();
					$allHeaders.show();
				}
			}
		});
	
		switch (Twinkle.tag.mode) {
			case 'article':
				Window.setTitle('Gán nhãn bảo trì bài viết');
	
	
				// Build sorting and lookup object flatObject, which is always
				// needed but also used to generate the alphabetical list
				// Would be infinitely better with Object.values, but, alas, IE 11
				Twinkle.tag.article.flatObject = {};
				Object.keys(Twinkle.tag.article.tagList).forEach(function(group) {
					Object.keys(Twinkle.tag.article.tagList[group]).forEach(function(subgroup) {
						if (Array.isArray(Twinkle.tag.article.tagList[group][subgroup])) {
							Twinkle.tag.article.tagList[group][subgroup].forEach(function(item) {
								Twinkle.tag.article.flatObject[item.tag] = { description: item.description, excludeMI: !!item.excludeMI };
							});
						} else {
							Twinkle.tag.article.flatObject[Twinkle.tag.article.tagList[group][subgroup].tag] = {description: Twinkle.tag.article.tagList[group][subgroup].description, excludeMI: !!Twinkle.tag.article.tagList[group][subgroup].excludeMI };
						}
					});
				});
	
	
				form.append({
					type: 'select',
					name: 'sortorder',
					label: 'Xem danh sách này:',
					tooltip: 'Bạn có thể thay đổi thứ tự chế độ xem mặc định trong tùy chọn Twinkle của mình (WP: TWPREFS).',
					event: Twinkle.tag.updateSortOrder,
					list: [
						{ type: 'option', value: 'cat', label: 'Theo thể loại', selected: Twinkle.getPref('tagArticleSortOrder') === 'cat' },
						{ type: 'option', value: 'alpha', label: 'Theo thứ tự ABC', selected: Twinkle.getPref('tagArticleSortOrder') === 'alpha' }
					]
				});
	
	
				if (!Twinkle.tag.canRemove) {
					var divElement = document.createElement('div');
					divElement.innerHTML = 'Để xóa các thẻ hiện có, vui lòng mở menu Gán nhãn (Tag) từ phiên bản hiện tại của bài viết';
					form.append({
						type: 'div',
						name: 'untagnotice',
						label: divElement
					});
				}
	
				form.append({
					type: 'div',
					id: 'tagWorkArea',
					className: 'morebits-scrollbox',
					style: 'max-height: 28em'
				});
	
				form.append({
					type: 'checkbox',
					list: [
						{
							label: 'Gom nhóm bên trong bản mẫu {{nhiều vấn đề}} nếu có thể',
							value: 'group',
							name: 'group',
							tooltip: 'Nếu áp dụng hai hay nhiều bản mẫu được hỗ trợ bởi bản mẫu {{nhiều vấn đề}} và checkbox này được đánh dấu, tất cả các bản mẫu được hỗ trợ sẽ được gom nhóm bên trong một bản mẫu {{nhiều vấn đề}}.',
							checked: '' // bỏ check mặc định gom nhóm bản mẫu:Nhiều vấn đề
							//checked: Twinkle.getPref('groupByDefault')
						}
					]
				});
	
				form.append({
					type: 'input',
					label: 'Lý do',
					name: 'reason',
					tooltip: 'Lý do để được thêm vào trong bản tóm tắt chỉnh sửa. Được đề xuất khi xóa thẻ.',
					size: '60px'
				});
	
				break;
	
			case 'file':
				Window.setTitle('Gán nhãn bảo trì tập tin');
	
				$.each(Twinkle.tag.fileList, function(groupName, group) {
					form.append({ type: 'header', label: groupName });
					form.append({ type: 'checkbox', name: 'tags', list: group });
				});
	
				if (Twinkle.getPref('customFileTagList').length) {
					form.append({ type: 'header', label: 'Các thẻ tùy chỉnh' });
					form.append({ type: 'checkbox', name: 'tags', list: Twinkle.getPref('customFileTagList') });
				}
				break;
	
			case 'redirect':
				Window.setTitle('Gán nhãn đổi hướng');
	
				var i = 1;
				$.each(Twinkle.tag.redirectList, function(groupName, group) {
					form.append({ type: 'header', id: 'tagHeader' + i, label: groupName });
					var subdiv = form.append({ type: 'div', id: 'tagSubdiv' + i++ });
					$.each(group, function(subgroupName, subgroup) {
						subdiv.append({ type: 'div', label: [ Morebits.htmlNode('b', subgroupName) ] });
						subdiv.append({
							type: 'checkbox',
							name: 'tags',
							list: subgroup.map(function (item) {
								return { value: item.tag, label: '{{' + item.tag + '}}: ' + item.description, subgroup: item.subgroup };
							})
						});
					});
				});
	
				if (Twinkle.getPref('customRedirectTagList').length) {
					form.append({ type: 'header', label: 'Các thẻ tùy chỉnh' });
					form.append({ type: 'checkbox', name: 'tags', list: Twinkle.getPref('customRedirectTagList') });
				}
				break;
	
			default:
				var temp_mode = Twinkle.tag.mode === 'article'?'bài viết':'trang đổi hướng hoặc tập tin'; // Alphama
				alert('Twinkle.tag: không rõ chế độ ' + temp_mode);
				break;
		}
	
		if (document.getElementsByClassName('patrollink').length) {
			form.append({
				type: 'checkbox',
				list: [
					{
						label: 'Đánh dấu trang là đã được tuần tra / xem xét',
						value: 'patrol',
						name: 'patrol',
						//checked: ''
						checked: Twinkle.getPref('markTaggedPagesAsPatrolled')
					}
				]
			});
		}
		form.append({ type: 'submit', className: 'tw-tag-submit' });
	
		var result = form.render();
		Window.setContent(result);
		Window.display();
	
		// for quick filter:
		$allCheckboxDivs = $(result).find('[name$=tags]').parent();
		$allHeaders = $(result).find('h5');
		result.quickfilter.focus();  // place cursor in the quick filter field as soon as window is opened
		result.quickfilter.autocomplete = 'off'; // disable browser suggestions
		result.quickfilter.addEventListener('keypress', function(e) {
			if (e.keyCode === 13) { // prevent enter key from accidentally submitting the form
				e.preventDefault();
				return false;
			}
		});
	
		if (Twinkle.tag.mode === 'article') {
	
			Twinkle.tag.alreadyPresentTags = [];
	
			if (Twinkle.tag.canRemove) {
				// Look for existing maintenance tags in the lead section and put them in array
	
				// All tags are HTML table elements that are direct children of .mw-parser-output,
				// except when they are within {{multiple issues}}
				$('.mw-parser-output').children().each(function parsehtml(i, e) {
	
					// break out on encountering the first heading, which means we are no
					// longer in the lead section
					if (e.tagName === 'H2') {
						return false;
					}
	
					// The ability to remove tags depends on the template's {{ambox}} |name=
					// parameter bearing the template's correct name (preferably) or a name that at
					// least redirects to the actual name
	
					// All tags have their first class name as "box-" + template name
					if (e.className.indexOf('box-') === 0) {
						if (e.classList[0] === 'box-Nhiều_vấn_đề') {
							$(e).find('.ambox').each(function(idx, e) {
								var tag = e.classList[0].slice(4).replace(/_/g, ' ');
								Twinkle.tag.alreadyPresentTags.push(tag);
							});
							return true; // continue
						}
	
						var tag = e.classList[0].slice(4).replace(/_/g, ' ');
						if (tag === 'Chất lượng kém/nguồn')  // Alphama
							tag = 'Chất lượng kém';
						Twinkle.tag.alreadyPresentTags.push(tag);
					}
				});
	
				// {{Uncategorized}} and {{Improve categories}} are usually placed at the end
				if ($('.box-Chưa_phân_loại').length) {
					Twinkle.tag.alreadyPresentTags.push('Chưa phân loại');
				}
				if ($('.box-Cải_thiện_thể_loại').length) {
					Twinkle.tag.alreadyPresentTags.push('Cải thiện thể loại');
				}
	
			}
	
			// Add status text node after Submit button
			var statusNode = document.createElement('small');
			statusNode.id = 'tw-tag-status';
			Twinkle.tag.status = {
				// initial state; defined like this because these need to be available for reference
				// in the click event handler
				numAdded: 0,
				numRemoved: 0
			};
			$('button.tw-tag-submit').after(statusNode);
	
			// fake a change event on the sort dropdown, to initialize the tag list
			var evt = document.createEvent('Event');
			evt.initEvent('change', true, true);
			result.sortorder.dispatchEvent(evt);
	
		} else {
			// Redirects and files: Add a link to each template's description page
			Morebits.quickForm.getElements(result, 'tags').forEach(generateLinks);
		}
	};
	
	
	// $allCheckboxDivs and $allHeaders are defined globally, rather than in the
	// quickfilter event function, to avoid having to recompute them on every keydown
	var $allCheckboxDivs, $allHeaders;
	
	Twinkle.tag.updateSortOrder = function(e) {
		var form = e.target.form;
		var sortorder = e.target.value;
		Twinkle.tag.checkedTags = form.getChecked('tags');
	
		var container = new Morebits.quickForm.element({ type: 'fragment' });
	
		// function to generate a checkbox, with appropriate subgroup if needed
		var makeCheckbox = function(tag, description) {
			var checkbox = { value: tag, label: '{{' + tag + '}}: ' + description };
			if (Twinkle.tag.checkedTags.indexOf(tag) !== -1) {
				checkbox.checked = true;
			}
			switch (tag) {
				case 'Chất lượng kém':
					checkbox.subgroup = {
						name: 'cleanup',
						type: 'input',
						label: 'Nêu lý do vì sao chất lượng kém: ',
						tooltip: 'Bắt buộc phải có.',
						size: 35
					};
					break;
				case 'Cần dọn dẹp':
					checkbox.subgroup = {
						name: 'cleanup',
						type: 'input',
						label: 'Nêu lý do cụ thể vì sao cần dọn dẹp: ',
						tooltip: 'Bắt buộc phải có.',
						size: 35
					};
					break;
				case 'Close paraphrasing':
					checkbox.subgroup = {
						name: 'closeParaphrasing',
						type: 'input',
						label: 'Nguồn: ',
						tooltip: 'Nội dung viết/diễn giải gần giống với nguồn có bản quyền'
					};
					break;
				case 'Biên tập':
					checkbox.subgroup = {
						name: 'copyEdit',
						type: 'input',
						label: '"Cần sửa các lỗi ngữ pháp, chính tả, tính mạch lạc, trau chuốt lối hành văn tiếng Việt" ',
						tooltip: 'Ví dụ, "sửa chính tả tiếng Việt". Không bắt buộc.',
						size: 35
					};
					break;
				case 'Chép dán':
					checkbox.subgroup = {
						name: 'copypaste',
						type: 'input',
						label: 'Nguồn URL: ',
						tooltip: 'Nếu biết.',
						size: 50
					};
					break;
				case 'Mở rộng ngôn ngữ':
					checkbox.subgroup = [ {
						name: 'expandLanguageLangCode',
						type: 'input',
						label: 'Mã ngôn ngữ: ',
						tooltip: 'Mã ngôn ngữ của ngôn ngữ mà bài viết sẽ được mở rộng, ví dụ, enwiki là dự án tiếng Anh'
					}, {
						name: 'expandLanguageArticle',
						type: 'input',
						label: 'Tên bài viết: ',
						tooltip: 'Tên bài viết tiếng nước ngoài, không có tiền tố interwiki'
					}
					];
					break;
				case 'Expert needed':
					checkbox.subgroup = [
						{
							name: 'expertNeeded',
							type: 'input',
							label: 'Tên của dự án WikiProject tương đương: ',
							tooltip: 'Optionally, enter the name of a WikiProject which might be able to help recruit an expert. Don\'t include the "WikiProject" prefix.'
						},
						{
							name: 'expertNeededReason',
							type: 'input',
							label: 'Lý do: ',
							tooltip: 'Short explanation describing the issue. Either Reason or Talk link is required.'
						},
						{
							name: 'expertNeededTalk',
							type: 'input',
							label: 'Thảo luận trò chuyện: ',
							tooltip: 'Name of the section of this article\'s talk page where the issue is being discussed. Do not give a link, just the name of the section. Either Reason or Talk link is required.'
						}
					];
					break;
				case 'Tầm nhìn hẹp':
					checkbox.subgroup = {
						name: 'globalizeRegion',
						type: 'input',
						label: 'Tập trung quá mức vào quốc gia hoặc khu vực nào đó'
					};
					break;
				case 'Trộn lịch sử':
					checkbox.subgroup = [
						{
							name: 'histmergeOriginalPage',
							type: 'input',
							label: 'Bài kia: ',
							tooltip: 'Tên của trang sẽ được hợp nhất vào trang này (bắt buộc).'
						},
						{
							name: 'histmergeReason',
							type: 'input',
							label: 'Lý do: ',
							tooltip: 'Giải thích ngắn gọn lý do cần trộn lịch sử. Nên bắt đầu bằng "bởi vì" và kết thúc bằng dấu chấm.'
						},
						{
							name: 'histmergeSysopDetails',
							type: 'input',
							label: 'Chi tiết thêm: ',
							tooltip: 'Đối với các trường hợp phức tạp, hãy cung cấp thêm hướng dẫn cho quản trị viên xem xét.'
						}
					];
					break;
				case 'Hợp nhất':
				case 'Hợp nhất từ':
				case 'Hợp nhất đến':
					var otherTagName = 'Hợp nhất';
					switch (tag) {
						case 'Hợp nhất đến':
							otherTagName = 'Hợp nhất đến';
							break;
						case 'Hợp nhất từ':
							otherTagName = 'Hợp nhất từ';
							break;
						// no default
					}
					checkbox.subgroup = [
						{
							name: 'mergeTarget',
							type: 'input',
							label: 'Các bài viết khác: ',
							tooltip: 'Nếu chỉ định nhiều bài viết, hãy phân tách chúng bằng các ký tự gạch đầu dòng: Bài viết 1 | Bài viết 2'
						},
						{
							type: 'checkbox',
							list: [
								{
									name: 'mergeTagOther',
									label: 'Gắn nhãn bài viết khác bằng một nhãn {{' + otherTagName + '}}',
									checked: true,
									tooltip: 'Chỉ khả dụng nếu một tên bài viết được nhập vào.'
								}
							]
						}
					];
					if (mw.config.get('wgNamespaceNumber') === 0) {
						checkbox.subgroup.push({
							name: 'mergeReason',
							type: 'textarea',
							label: 'Lý do hợp nhất (sẽ được đăng trên ' + ' trang thảo luận ' + 
								(tag === 'Hợp nhất đến' ? 'của bài viết khác' : 'của bài viết này):'),
							tooltip: 'Tùy chọn, nhưng đặc biệt khuyến khích. Để trống nếu không muốn. Chỉ khả dụng nếu một tên bài viết được nhập vào.'
						});
					}
					break;
				case 'Not English':
				case 'Rough translation':
					checkbox.subgroup = [
						{
							name: 'translationLanguage',
							type: 'input',
							label: 'Ngôn ngữ của bài viết (nếu biết): ',
							tooltip: 'Hãy cân nhắc tham khảo ở [[Wikipedia:Biểu đồ nhận dạng ngôn ngữ|WP:LRC]]) để được trợ giúp. Nếu liệt kê bài viết tại PNT, vui lòng cố gắng tránh để trống ô này, trừ khi bạn hoàn toàn không chắc chắn phải làm gì.'
						}
					];
					if (tag === 'Not English') {
						checkbox.subgroup.push({
							type: 'checkbox',
							list: [
								{
									name: 'translationNotify',
									label: 'Thông báo cho người tạo bài viết',
									checked: true,
									tooltip: "Places {{uw-notenglish}} on the creator's talk page."
								}
							]
						});
					}
					if (mw.config.get('wgNamespaceNumber') === 0) {
						checkbox.subgroup.push({
							type: 'checkbox',
							list: [
								{
									name: 'translationPostAtPNT',
									label: 'List this article at Wikipedia:Pages needing translation into English (PNT)',
									checked: true
								}
							]
						});
						checkbox.subgroup.push({
							name: 'translationComments',
							type: 'textarea',
							label: 'Additional comments to post at PNT',
							tooltip: 'Optional, and only relevant if "List this article ..." above is checked.'
						});
					}
					break;
				case 'Không nổi bật':
					checkbox.subgroup = {
						name: 'notability',
						type: 'select',
						list: [
							{ label: "{{không nổi bật}}: chủ đề của bài viết có thể không đáp ứng nguyên tắc chung về độ nổi bật", value: 'none' },
							{ label: '{{không nổi bật|Academics}}: hướng dẫn về độ nổi bật cho giới học thuật', value: 'Academics' },
							{ label: '{{không nổi bật|Astro}}: hướng dẫn về độ nổi bật cho các đối tượng thiên văn', value: 'Astro' },
							{ label: '{{không nổi bật|Biographies}}: hướng dẫn về độ nổi bật cho thông tin tiểu sử (người)', value: 'Biographies' },
							{ label: '{{không nổi bật|Books}}: hướng dẫn về độ nổi bật cho sách vở', value: 'Books' },
							{ label: '{{không nổi bật|Companies}}: hướng dẫn về độ nổi bật cho các công ty và tổ chức', value: 'Companies' },
							{ label: '{{không nổi bật|Events}}: hướng dẫn về độ nổi bật cho các sự kiện', value: 'Events' },
							{ label: '{{không nổi bật|Films}}: hướng dẫn về độ nổi bật cho phim ảnh', value: 'Films' },
							{ label: '{{không nổi bật|Geographic}}: hướng dẫn về độ nổi bật cho các đặc điểm địa lý', value: 'Geographic' },
							{ label: '{{không nổi bật|Lists}}: hướng dẫn về độ nổi bật cho các danh sách độc lập', value: 'Lists' },
							{ label: '{{không nổi bật|Music}}: hướng dẫn về độ nổi bật cho âm nhạc', value: 'Music' },
							{ label: '{{không nổi bật|Neologisms}}: hướng dẫn về độ nổi bật cho cách dùng từ (chữ) mới', value: 'Neologisms' },
							{ label: '{{không nổi bật|Numbers}}:hướng dẫn về độ nổi bật cho các con số', value: 'Numbers' },
							{ label: '{{không nổi bật|Products}}: hướng dẫn về độ nổi bật cho các sản phẩm và dịch vụ', value: 'Products' },
							{ label: '{{không nổi bật|Sports}}: hướng dẫn về độ nổi bật cho các môn thể thao và vận động viên', value: 'Sports' },
							{ label: '{{không nổi bật|Television}}: hướng dẫn về độ nổi bật cho các show diễn truyền hình', value: 'Television' },
							{ label: '{{không nổi bật|Web}}: hướng dẫn về độ nổi bật cho nội dung web', value: 'Web' }
						]
					};
					break;
				default:
					break;
			}
			return checkbox;
		};
	
		var makeCheckboxesForAlreadyPresentTags = function() {
			container.append({ type: 'header', id: 'tagHeader0', label: 'Các nhãn hiện có' });
			var subdiv = container.append({ type: 'div', id: 'tagSubdiv0' });
			var checkboxes = [];
			var unCheckedTags = e.target.form.getUnchecked('existingTags');
			Twinkle.tag.alreadyPresentTags.forEach(function(tag) {
				var checkbox =
					{
						value: tag,
						label: '{{' + tag + '}}' + (Twinkle.tag.article.flatObject[tag] ? ': ' + Twinkle.tag.article.flatObject[tag].description : ''),
						checked: unCheckedTags.indexOf(tag) === -1,
						style: 'font-style: italic'
					};
	
				checkboxes.push(checkbox);
			});
			subdiv.append({
				type: 'checkbox',
				name: 'existingTags',
				list: checkboxes
			});
		};
	
	
		if (sortorder === 'cat') { // categorical sort order
			// function to iterate through the tags and create a checkbox for each one
			var doCategoryCheckboxes = function(subdiv, subgroup) {
				var checkboxes = [];
				$.each(subgroup, function(k, item) {
					if (Twinkle.tag.alreadyPresentTags.indexOf(item.tag) === -1) {
						checkboxes.push(makeCheckbox(item.tag, item.description));
					}
				});
				subdiv.append({
					type: 'checkbox',
					name: 'tags',
					list: checkboxes
				});
			};
	
			if (Twinkle.tag.alreadyPresentTags.length > 0) {
				makeCheckboxesForAlreadyPresentTags();
			}
			var i = 1;
			// go through each category and sub-category and append lists of checkboxes
			$.each(Twinkle.tag.article.tagList, function(groupName, group) {
				container.append({ type: 'header', id: 'tagHeader' + i, label: groupName });
				var subdiv = container.append({ type: 'div', id: 'tagSubdiv' + i++ });
				if (Array.isArray(group)) {
					doCategoryCheckboxes(subdiv, group);
				} else {
					$.each(group, function(subgroupName, subgroup) {
						subdiv.append({ type: 'div', label: [ Morebits.htmlNode('b', subgroupName) ] });
						doCategoryCheckboxes(subdiv, subgroup);
					});
				}
			});
		} else { // alphabetical sort order
			if (Twinkle.tag.alreadyPresentTags.length > 0) {
				makeCheckboxesForAlreadyPresentTags();
				container.append({ type: 'header', id: 'tagHeader1', label: 'Các nhãn có thể thêm vào' });
			}
	
			// Avoid repeatedly resorting
			Twinkle.tag.article.alphabeticalList = Twinkle.tag.article.alphabeticalList || Object.keys(Twinkle.tag.article.flatObject).sort();
			var checkboxes = [];
			Twinkle.tag.article.alphabeticalList.forEach(function(tag) {
				if (Twinkle.tag.alreadyPresentTags.indexOf(tag) === -1) {
					checkboxes.push(makeCheckbox(tag, Twinkle.tag.article.flatObject[tag].description));
				}
			});
			container.append({
				type: 'checkbox',
				name: 'tags',
				list: checkboxes
			});
		}
	
		// append any custom tags
		if (Twinkle.getPref('customTagList').length) {
			container.append({ type: 'header', label: 'Các nhãn tùy chọn' });
			container.append({ type: 'checkbox', name: 'tags',
				list: Twinkle.getPref('customTagList').map(function(el) {
					el.checked = Twinkle.tag.checkedTags.indexOf(el.value) !== -1;
					return el;
				})
			});
		}
	
		var $workarea = $(form).find('#tagWorkArea');
		var rendered = container.render();
		$workarea.empty().append(rendered);
	
		// for quick filter:
		$allCheckboxDivs = $workarea.find('[name=tags], [name=existingTags]').parent();
		$allHeaders = $workarea.find('h5, .quickformDescription');
		form.quickfilter.value = ''; // clear search, because the search results are not preserved over mode change
		form.quickfilter.focus();
	
		// style adjustments
		$workarea.find('h5').css({ 'font-size': '110%' });
		$workarea.find('h5:not(:first-child)').css({ 'margin-top': '1em' });
		$workarea.find('div').filter(':has(span.quickformDescription)').css({ 'margin-top': '0.4em' });
	
		Morebits.quickForm.getElements(form, 'existingTags').forEach(generateLinks);
		Morebits.quickForm.getElements(form, 'tags').forEach(generateLinks);
	
		// tally tags added/removed, update statusNode text
		var statusNode = document.getElementById('tw-tag-status');
		$('[name=tags], [name=existingTags]').click(function() {
			if (this.name === 'tags') {
				Twinkle.tag.status.numAdded += this.checked ? 1 : -1;
			} else if (this.name === 'existingTags') {
				Twinkle.tag.status.numRemoved += this.checked ? -1 : 1;
			}
	
			var firstPart = 'Đang thêm ' + Twinkle.tag.status.numAdded + ' nhãn' + (Twinkle.tag.status.numAdded > 1 ? '' : '');
			var secondPart = 'Đang xóa ' + Twinkle.tag.status.numRemoved + ' nhãn' + (Twinkle.tag.status.numRemoved > 1 ? '' : '');
			statusNode.textContent =
				(Twinkle.tag.status.numAdded ? '  ' + firstPart : '') +
				(Twinkle.tag.status.numRemoved ? (Twinkle.tag.status.numAdded ? '; ' : '  ') + secondPart : '');
		});
	};
	
	/**
	 * Adds a link to each template's description page
	 * @param {Morebits.quickForm.element} checkbox  associated with the template
	 */
	var generateLinks = function(checkbox) {
		var link = Morebits.htmlNode('a', '>');
		link.setAttribute('class', 'tag-template-link');
		var tagname = checkbox.values;
		link.setAttribute('href', mw.util.getUrl(
			(tagname.indexOf(':') === -1 ? 'Template:' : '') +
			(tagname.indexOf('|') === -1 ? tagname : tagname.slice(0, tagname.indexOf('|')))
		));
		link.setAttribute('target', '_blank');
		$(checkbox).parent().append(['\u00A0', link]);
	};
	
	
	// Khu vực dành cho các nhãn BẢO QUẢN BÀI VIẾT
	Twinkle.tag.article = {};
	
	// Tags arranged by category; will be used to generate the alphabetical list,
	// but tags should be in alphabetical order within the categories
	// excludeMI: true indicate a tag that *does not* work inside {{multiple issues}}
	// Add new categories with discretion - the list is long enough as is!
	Twinkle.tag.article.tagList = {
		'Các nhãn phổ biến': {
			'Danh sách nhãn': [
			{ tag: 'Bài quảng cáo', description: '{{Advert}} -- được viết như quảng cáo' },
			{ tag: 'Chú thích trong bài', description: '{{More citations needed}} -- có thể đã có vài nguồn nhưng vẫn cần thêm nguồn hoặc tài liệu tham khảo để xác minh' },
			{ tag: 'Cần biên tập', description: '{{Expert needed}} -- cần người am hiểu về chủ đề tham gia biên tập bài viết' },
			{ tag: 'Chất lượng kém', description: '{{Chất lượng kém/nguồn}} hoặc {{clk}} -- bài có chất lượng kém (dịch máy, thiếu nguồn, không biên tập, trình bày cẩu thả,...)' }, // has a subgroup with text input
			{ tag: 'Đang diễn ra', description: '{{Current}} -- một sự kiện đang diễn ra', excludeMI: true }, // Works but not intended for use in MI
			{ tag: 'Đang viết', description: '{{Under construction}} -- đang trong quá trình mở rộng hoặc sửa đổi lớn', excludeMI: true },
			{ tag: 'Hợp nhất', description: '{{Merge}} -- cần hợp nhất với một bài viết khác', excludeMI: true },   // these three have a subgroup with several options
			{ tag: 'Không nổi bật', description: '{{Notability}} -- chủ thể có thể không đáp ứng nguyên tắc chung về độ nổi bật' },
			{ tag: 'TSNDS không nguồn', description: '{{TSNDS không nguồn}} -- Tiểu sử người đang sống (TSNĐS) không có nguồn nào cả (với các bài viết tạo sau ngày 14/03/2021, hãy sử dụng BLP PROD)' },
			{ tag: 'Thiếu nguồn gốc', description: '{{Thiếu nguồn gốc}} -- hoàn toàn không có nguồn' },
			{ tag: 'Tầm nhìn hẹp', description: '{{Globalize}} -- có thể không đại diện cho một cái nhìn toàn cầu về chủ đề' },
			{ tag: 'Thái độ trung lập', description: '{{POV}} -- không duy trì quan điểm trung lập' },
			{ tag: 'Vi phạm bản quyền', description: '{{copyvio}} -- sao chép nguyên văn từ trang mạng/sách vở đã giữ bản quyền mà chưa thấy sự cho phép của tác giả' },
			{ tag: 'Wiki hóa', description: '{{wikify}} -- cần chỉnh sửa bài viết theo đúng định dạng của Wikipedia' }
			]
		},
		'Các nhãn bảo trì và dọn dẹp': {
			'Dọn dẹp chung': [
				{ tag: 'Cần dọn dẹp', description: '{{Cleanup}} -- yêu cầu dọn dẹp' },  // has a subgroup with text input
				{ tag: 'Cần dọn dẹp-viết lại', description: "{{Cleanup rewrite}} -- cần được viết lại hoàn toàn để tuân thủ theo các tiêu chuẩn chất lượng của Wikipedia" },
				{ tag: 'Biên tập', description: '{{Biên tập}} -- sửa các lỗi ngữ pháp, chính tả, tính mạch lạc, trau chuốt hành văn tiếng Việt' },  // has a subgroup with text input
				{ tag: 'Định dạng', description: "{{Định dạng}} -- cần định dạng" }
			],
			'Nội dung không hợp lệ': [
				{ tag: 'Diễn giải gần giống nội dung bản quyền', description: '{{Close paraphrasing}} -- chứa các diễn giải gần giống nguồn có bản quyền' },
				{ tag: 'Chép dán', description: '{{Copypaste}} -- có thể đã được sao chép và dán từ một nơi khác', excludeMI: true },  // has a subgroup with text input
				{ tag: 'Quá nhiều liên kết ngoài', description: '{{External links}} -- có những liên kết ngoài phạm quy' },
				{ tag: 'Không tự do', description: '{{Non-free}} -- có thể chứa quá nhiều nội dung, tập tin có bản quyền' },
				{ tag: 'Tự mâu thuẫn', description: "{{Tự mâu thuẫn}} -- có những tình tiết tự mâu thuẫn nhau" }
			],
			'Bố cục': [
				{ tag: 'Dọn dẹp lại', description: "{{Cleanup reorganize}} -- cần sửa lại bố cục toàn bài" },
				{ tag: 'Phân chia thành các mục con', description: '{{Sections}} -- cần được chia thành các đề mục để người đọc dễ nắm bắt nội dung' },
				{ tag: 'Quá nhiều đề mục', description: '{{Too many sections}} -- quá nhiều đề mục' },
				{ tag: 'Quá dài', description: '{{Very long}} -- quá dài để đọc và điều hướng một cách dễ dàng' },
				{ tag: 'Chia', description: '{{Chia}} -- chia bài này ra thành nhiều bài hoặc tạo bài con cho bài này' }
			],
			'Phần mở đầu':[
				{ tag: 'Thiếu mở đầu', description: '{{Lead missing}} -- không có phần mở đầu' },
				{ tag: 'Viết lại phần mở đầu', description: '{{Lead rewrite}} -- phần mở đầu cần được viết lại theo quy định' },
				{ tag: 'Mở đầu quá dài', description: '{{Lead too long}} -- phần mở đầu quá dài so với độ dài của bài' },
				{ tag: 'Mở đầu quá ngắn', description: '{{Lead too short}} -- phần mở đầu quá ngắn và cần được mở rộng để tóm tắt các điểm chính' },
				{ tag: 'Chỉ có ở phần mở đầu', description: '{{Chỉ có ở phần mở đầu}} -- một số thông tin không có trong thân bài' }
			],
			'Tiểu sử người đang sống': [
				{ tag: 'Cleanup Congress bio', description: '{{Cleanup Congress bio}} -- tiểu sử chép từ Danh mục Tiểu sử Quốc hội Hoa Kỳ' },
			 ],
			'Bài về tác phẩm hư cấu': [
				{ tag: 'Tóm tắt cốt truyện', description: '{{All plot}} -- gần như chỉ thấy tóm tắt cốt truyện, thiếu thông tin về quá trình sáng tác, tạo ra tác phẩm, đánh giá chuyên môn' },
				{ tag: 'Cách viết hư cấu', description: '{{Fiction}} -- không phân biệt được giữa thực tế và hư cấu' },
				//{ tag: 'In-universe', description: 'subject is fictional and needs rewriting to provide a non-fictional perspective' },
				{ tag: 'Thiếu tóm tắt cốt truyện', description: '{{No plot}} -- cần một bản tóm tắt cốt truyện' },
				{ tag: 'Tóm lược dài', description: '{{Long plot}} -- tóm tắt cốt truyện quá dài hoặc quá chi tiết' }
			]
		},
		'Các vấn đề chung về nội dung': {
			'Độ nổi bật': [
				{ tag: 'Không nổi bật', description: '{{Notability}} -- chủ thể có thể không đáp ứng nguyên tắc chung về độ nổi bật' },  // has a subgroup with subcategories
				{ tag: 'Có nguồn', description: '{{Có nguồn}} -- có người đã thử tìm nguồn và cho rằng chủ thể này đủ độ nổi bật' }
			],
			'Phong cách viết': [
				{ tag: 'Bài quảng cáo', description: '{{Advert}} -- được viết như một quảng cáo' },
				//{ tag: 'Cleanup tense', description: 'does not follow guidelines on use of different tenses.' },
				{ tag: 'Bình luận cá nhân', description: '{{Essay-like}} -- viết như một bài luận cá nhân, tiểu luận chủ quan hay nghị luận và trình bày tư tưởng, quan điểm riêng của người viết' },
				{ tag: 'Quan điểm người hâm mộ', description: "{{Fanpov}} -- được viết từ quan điểm của một người hâm mộ" },
				{ tag: 'Như sơ yếu lý lịch', description: '{{Like resume}} -- được viết như một sơ yếu lý lịch' },
				{ tag: 'Cẩm nang', description: '{{Cẩm nang}} -- viết như cẩm nang hướng dẫn du lịch, hướng dẫn cách chơi, cách làm, cách sử dụng, cách nấu, cách thực hiện quy trình...' },
				{ tag: 'Dọn dẹp văn phong báo chí', description: '{{Cleanup-PR}} -- đọc như một thông cáo báo chí hoặc bài viết tin tức' },
				{ tag: 'Trích dẫn quá dài', description: '{{Over-quotation}} -- trích dẫn quá nhiều hoặc quá dài cho một bài viết bách khoa' },
				{ tag: 'Văn xuôi', description: '{{Prose}} -- đang ở dạng danh sách nhưng cần chuyển thành dạng văn xuôi' },
				{ tag: 'Chuyên môn', description: '{{Technical}} -- lối viết quá nặng về chuyên môn để hầu hết người đọc có thể hiểu' },
				{ tag: 'Văn phong', description: '{{Tone}} -- giọng văn không bách khoa theo kiểu Wikipedia' },
				{ tag: 'Khẩu ngữ', description: '{{Khẩu ngữ}} -- dùng khẩu ngữ, văn nói, từ lóng' },
				{ tag: 'Sách giáo khoa', description: '{{Sách giáo khoa}} -- viết như sách giáo khoa, giáo trình đại học' },
				{ tag: 'Specific', description: '{{Specific}} -- chủ yếu chỉ liệt kê các ví dụ, thiếu thông tin khái quát về chủ đề bài viết' }
			],
			'Giác quan (hoặc thiếu giác quan)': [
				{ tag: 'Gây nhầm lẫn', description: '{{Confusing}} -- khó hiểu hoặc không rõ ràng' },
				{ tag: 'Khó hiểu', description: '{{Incomprehensible}} -- nội dung rất tối nghĩa hoặc khó hiểu' },
				{ tag: 'Không trọng tâm', description: '{{Unfocused}} -- thiếu trọng tâm, lan man hoặc viết về nhiều hơn một chủ đề' },
				{ tag: 'Lạc đề', description: '{{Lạc đề}} -- lạc đề hoặc hơi lạc đề' },
				{ tag: 'Đoạn quan trọng', description: '{{Đoạn quan trọng}} -- nghi ngờ độ quan trọng của đoạn này so với chủ đề bài viết' }
			],
			'Thông tin và chi tiết': [
				{ tag: 'Ngữ cảnh', description: '{{Context}} -- không đủ ngữ cảnh cho những người không quen thuộc với chủ đề này' },
				{ tag: 'Cleanup book', description: '{{Cleanup book}} -- không đủ ngữ cảnh về quyển sách' },
				{ tag: 'Cần chuyên gia', description: '{{Expert needed}} -- cần sự chú ý từ một chuyên gia về chủ đề này' },
				{ tag: 'Quá chi tiết', description: '{{Overly detailed}} -- quá nhiều chi tiết phức tạp' },
				{ tag: 'Nhấn mạnh quá mức', description: '{{Undue weight}} -- thiên lệch, viết quá nhiều về một số lập trường, sự cố hoặc tranh cãi' },
				{ tag: 'Chuyện bên lề', description: '{{Chuyện bên lề}} -- liệt kê các thông tin bên lề' },
				{ tag: 'Quá nhiều ảnh', description: '{{Quá nhiều ảnh}} -- quá nhiều hình ảnh, biểu đồ hoặc sơ đồ so với chiều dài tổng thể của bài' }
			],
			'Tính chất thời gian': [
				{ tag: 'Đang diễn ra', description: '{{Current}} -- một sự kiện đang diễn ra', excludeMI: true }, // Works but not intended for use in MI
				{ tag: 'Truyền hình tương lai', description: '{{Truyền hình tương lai}} -- chương trình truyền hình sắp phát sóng' },
				{ tag: 'Mới qua đời', description: '{{Mới qua đời}} -- chủ thể trong bài vừa qua đời' },
				{ tag: 'Thảm họa đang xảy ra', description: '{{Thảm họa đang xảy ra}} -- thảm họa đang xảy ra' },
				{ tag: 'Lỗi thời hoặc sai thời', description: '{{Lỗi thời hoặc sai thời}} -- dùng từ sai so với giai đoạn lịch sử, nội dung đã lỗi thời mà không ghi số năm' },
				{ tag: 'Lỗi thời', description: '{{Update}} -- cần cập nhật các thông tin mới nhất' }
			],
			'Tính trung lập, thiên vị': [
				{ tag: 'Tự truyện', description: '{{Autobiography}} -- văn phong tự truyện và cách viết không trung lập' },
				{ tag: 'Có xung đột lợi ích', description: '{{COI}} -- người tạo bài hoặc người đóng góp chính cho bài viết có thể có xung đột lợi ích' },
				{ tag: 'Tầm nhìn hẹp', description: '{{Globalize}} -- có thể không đại diện cho một cái nhìn toàn cầu về chủ đề' },
				//{ tag: 'Over-coverage', description: 'extensive bias or disproportional coverage towards one or more specific regions' },
				{ tag: 'Tâng bốc', description: '{{Tâng bốc}} -- chứa các từ ngữ quảng bá một cách chủ quan mà không đưa ra dẫn chứng thực sự' },
				{ tag: 'Thái độ trung lập', description: '{{POV}} -- không duy trì quan điểm trung lập' },
				{ tag: 'Recentism', description: '{{Recentism}} -- chứa quá nhiều nội dung về các sự kiện diễn ra gần đây khiến bài bị mất cân đối' },
				{ tag: 'Quá ít quan điểm', description: '{{Too few opinions}} -- có thể không bao gồm tất cả các quan điểm quan trọng' },
				{ tag: 'Thù lao không công khai', description: '{{Undisclosed paid}} -- có thể đã được tạo hoặc chỉnh sửa để đổi lại các khoản thanh toán không được tiết lộ, không công khai' },
				{ tag: 'Diễn đạt không rõ ràng', description: '{{Weasel}} -- diễn đạt mơ hồ thường đi kèm thông tin thiên lệch hoặc không thể kiểm chứng được' }
			],
			'Tính chính xác': [
				{ tag: 'Phỏng đoán', description: '{{Phỏng đoán}} -- chứa các dự đoán không nguồn chứng thực, thông tin về những sự kiện sẽ không xảy ra' },
				{ tag: 'Tranh chấp', description: '{{Disputed}} -- nghi ngờ độ chính xác của bài' },
				{ tag: 'Tin vịt', description: '{{Tin vịt}} -- một phần hoặc toàn bài có thể là chuyện bịa đặt, không có thật' }
			],
			'Khả năng xác minh và nguồn': [
				//Xếp theo mức độ tăng dần, không nguồn xếp đầu tiên
				{ tag: 'TSNDS không nguồn', description: '{{TSNDS không nguồn}} -- Tiểu sử người đang sống (TSNĐS) không có nguồn nào cả (với các bài viết tạo sau ngày 14/03/2021, hãy sử dụng BLP PROD)' },
				{ tag: 'TSNDS nguồn', description: '{{TSNDS nguồn}} -- TSNĐS cần thêm nguồn để xác minh' },
				{ tag: 'TSNDS tự xuất bản', description: '{{TSNDS tự xuất bản}} -- TSNĐS chỉ chứa nguồn tự xuất bản nên cần thêm các nguồn khác' },
				{ tag: 'Thiếu nguồn gốc', description: '{{Thiếu nguồn gốc}} -- không có nguồn nào cả' },
				{ tag: 'Chỉ có một nguồn', description: '{{Chỉ có một nguồn}} -- gần như chỉ dựa vào một nguồn duy nhất' },
				{ tag: 'Chú thích trong bài', description: '{{More citations needed}} -- có thể đã có vài nguồn nhưng vẫn cần thêm nguồn và tài liệu tham khảo' },
				{ tag: 'Cần thêm nguồn y khoa', description: '{{Cần thêm nguồn y khoa}} -- cần thêm nguồn chuyên môn y khoa' },
				{ tag: 'Nguồn sơ cấp', description: '{{Nguồn sơ cấp}} -- dựa quá nhiều vào nguồn sơ cấp (vd, do chính chủ thể phát hành, sách tự truyện...)' },
				{ tag: 'Tự xuất bản', description: '{{Tự xuất bản}} -- chứa quá nhiều nguồn tự xuất bản (blog, diễn đàn, mạng xã hội, sách tự xuất bản...)' },
				{ tag: 'Thiếu nguồn từ bên thứ ba', description: '{{Third-party}} -- phụ thuộc quá nhiều vào các nguồn liên quan có quá chặt chẽ với chủ thể, cần nguồn trung lập hơn' },
				{ tag: 'Nguồn không đáng tin cậy', description: '{{Nguồn không đáng tin cậy}} -- một số nguồn có thể không đáng tin cậy theo quy định của Wikipedia' },
				{ tag: 'Kiểm tra chú thích', description: '{{Kiểm tra chú thích}} -- thông tin trong bài bách khoa không khớp với nguồn' },
				{ tag: 'Nghiên cứu chưa công bố', description: '{{Original research}} -- chứa nghiên cứu chưa công bố, phát hiện mới, dữ kiện mới, thông tin tự chế, tự tổng hợp, tự suy luận ra' },
				{ tag: 'Tổng hợp', description: '{{Tổng hợp}} -- chứa nội dung tự tổng hợp từ các nguồn tham khảo để truyền đạt các ý tưởng chưa hề tồn tại trong các nguồn đó' }
			]
		},
		'Các vấn đề cụ thể về nội dung': {
			'Ngôn ngữ': [
				//{ tag: 'Not English', description: 'written in a language other than English and needs translation', excludeMI: true },  // has a subgroup with several options
				{ tag: 'Đang dịch 2', description: '{{Đang dịch 2}} -- đang tiến hành dịch từ Wikipedia ngôn ngữ khác' },
				{ tag: 'Chưa dịch phần lớn', description: '{{Chưa dịch phần lớn}} -- phần lớn bài vẫn chưa dịch xong' },
				{ tag: 'Chất lượng dịch', description: '{{Rough translation}} -- dịch kém từ ngôn ngữ khác', excludeMI: true },  // has a subgroup with several options
				{ tag: 'Cần hiệu đính', description: '{{Cần hiệu đính}} -- cần người giỏi ngữ văn tiếng Việt hiệu đính' },
				{ tag: 'Mở rộng ngôn ngữ', description: '{{Mở rộng ngôn ngữ}} -- có thể nâng cấp bài bằng cách dịch từ Wikipedia ngôn ngữ khác', excludeMI: true }
			],
			'Liên kết trong bài': [
				{ tag: 'Đường cùng', description: '{{Dead end}} -- bài viết không có liên kết đến các bài viết khác' },
				{ tag: 'Mồ côi', description: '{{Orphan}} -- không được liên kết với bất kỳ bài viết nào' },
				{ tag: 'Quá nhiều liên kết', description: '{{Overlinked}} -- quá nhiều liên kết lặp, liên kết những từ ai cũng hiểu, không hữu ích cho người đọc' },
				{ tag: 'Quá ít liên kết', description: '{{Underlinked}} -- cần thêm các liên kết đến các bài viết khác để người đọc hiểu hơn về ngữ cảnh' }
			],
			'Kỹ thuật dẫn nguồn': [
				{ tag: 'Phong cách trích dẫn', description: '{{Citation style}} -- cách ghi nguồn không nhất quán' },
				{ tag: 'Toàn URL', description: '{{Cleanup bare URLs}} -- nguồn toàn là URL trần (bare URL), dễ bị hỏng liên kết' },
				{ tag: 'Chú thích trong hàng', description: '{{No footnotes}} -- có tài liệu tham khảo nhưng thân bài không có chú thích trong hàng nào' },
				{ tag: 'Cần nhiều trích dẫn trong bài hơn', description: '{{More footnotes}} -- có tài liệu tham khảo nhưng cần thêm chú thích trong hàng' },
				{ tag: 'Cần chú thích hoàn chỉnh', description: '{{Cần chú thích hoàn chỉnh}} -- chú thích nguồn còn thiếu tên bài, đơn vị xuất bản, tên tác giả, ngày tháng và số trang' },
				{ tag: 'Citations broken', description: '{{Citations broken}} -- nguồn trong chú thích bị hỏng hoặc lỗi thời' }
			],
			'Chuyển sang dự án Wiki khác': [
				{ tag: 'Di chuyển đến Wikiquote', description: 'yêu cầu chuyển các trích dẫn nguyên văn sang Wikiquote' },
				{ tag: 'Di chuyển đến Wikisource', description: 'yêu cầu chuyển nội dung văn thư sang Wikisource' },
				{ tag: 'Di chuyển đến Wiktionary', description: 'yêu cầu chuyển định nghĩa từ vựng sang Wiktionary' }
			],
			'Thể loại': [
				{ tag: 'Cải thiện thể loại', description: '{{Cải thiện thể loại}} -- cần thêm các thể loại khác hoặc phân vào thể loại con cụ thể hơn', excludeMI: true },
				{ tag: 'Chưa phân loại', description: '{{Chưa phân loại}] -- chưa xếp vào thể loại nào', excludeMI: true }
			]
		},
		'Trộn/Hợp nhất nội dung': [
			{ tag: 'Trộn lịch sử', description: '{{History merge}} một trang khác sẽ được hợp nhất lịch sử của nó vào trang này', excludeMI: true },
			{ tag: 'Hợp nhất', description: '{{Merge}} -- yêu cầu hợp nhất bài này vào một bài khác', excludeMI: true },   // these three have a subgroup with several options
			{ tag: 'Hợp nhất từ', description: '{{Merge from}} -- một bài viết khác nên được hợp nhất vào bài này', excludeMI: true },
			{ tag: 'Hợp nhất đến', description: '{{Merge to}} -- yêu cầu hợp nhất bài này vào một bài khác', excludeMI: true }
		],
		'Thông tin': [
			//{ tag: 'GOCEinuse', description: 'currently undergoing a major copy edit by the Guild of Copy Editors', excludeMI: true },
			{ tag: 'Đang tạo bài', description: '{{Đang tạo bài}} -- đang tạo bài mới' },
			{ tag: 'Đang sửa đổi', description: '{{In use}} -- đang trải qua một sửa đổi lớn trong thời gian ngắn', excludeMI: true },
			{ tag: 'Đang viết', description: '{{Under construction}} -- đang trong quá trình mở rộng hoặc đại tu', excludeMI: true }
		]
	};
	
	// Khu vực dành cho các nhãn ĐỊNH HƯỚNG
	// Not by policy, but the list roughly approximates items with >500
	// transclusions from Template:R template index
	Twinkle.tag.redirectList = {
		'Ngữ pháp, dấu câu và chính tả': {
			'Viết tắt': [
				{ tag: 'R from acronym', description: 'redirect from an acronym (e.g. POTUS) to its expanded form' },
				{ tag: 'R from initialism', description: 'redirect from an initialism (e.g. AGF) to its expanded form' },
				{ tag: 'R from MathSciNet abbreviation', description: 'redirect from MathSciNet publication title abbreviation to the unabbreviated title' },
				{ tag: 'R from NLM abbreviation', description: 'redirect from a NLM publication title abbreviation to the unabbreviated title' }
			],
			'Viết hoa': [
				{ tag: 'R from CamelCase', description: 'redirect from a CamelCase title' },
				{ tag: 'R from other capitalisation', description: 'redirect from a title with another method of capitalisation' },
				{ tag: 'R from miscapitalisation', description: 'redirect from a capitalisation error' }
			],
			'Ngữ pháp và dấu câu': [
				{ tag: 'R from modification', description: 'redirect from a modification of the target\'s title, such as with words rearranged' },
				{ tag: 'R from plural', description: 'redirect from a plural word to the singular equivalent' },
				{ tag: 'R to plural', description: 'redirect from a singular noun to its plural form' }
			],
			'Các phần của lời nói': [
				{ tag: 'R from verb', description: 'redirect from an English-language verb or verb phrase' },
				{ tag: 'R from adjective', description: 'redirect from an adjective (word or phrase that describes a noun)' }
			],
			'Chính tả': [
				{ tag: 'R from alternative spelling', description: 'redirect from a title with a different spelling' },
				{ tag: 'R from ASCII-only', description: 'redirect from a title in only basic ASCII to the formal title, with differences that are not diacritical marks or ligatures' },
				{ tag: 'R from diacritic', description: 'redirect from a page name that has diacritical marks (accents, umlauts, etc.)' },
				{ tag: 'R to diacritic', description: 'redirect to the article title with diacritical marks (accents, umlauts, etc.)' },
				{ tag: 'R from misspelling', description: 'redirect from a misspelling or typographical error' }
			]
		},
		'Tên thay thế': {
			'Chung': [
				{
					tag: 'R from alternative language',
					description: 'redirect from or to a title in another language',
					subgroup: [
						{
							name: 'altLangFrom',
							type: 'input',
							label: 'From language (two-letter code): ',
							tooltip: 'Enter the two-letter code of the language the redirect name is in; such as en for English, de for German'
						},
						{
							name: 'altLangTo',
							type: 'input',
							label: 'To language (two-letter code): ',
							tooltip: 'Enter the two-letter code of the language the target name is in; such as en for English, de for German'
						},
						{
							name: 'altLangInfo',
							type: 'div',
							label: $.parseHTML('<p>For a list of language codes, see <a href="/wiki/Wp:Template_messages/Redirect_language_codes">Wikipedia:Template messages/Redirect language codes</a></p>')
						}
					]
				},
				{ tag: 'R from alternative name', description: 'redirect from a title that is another name, a pseudonym, a nickname, or a synonym' },
				{ tag: 'R from ambiguous sort name', description: 'redirect from an ambiguous sort name to a page or list that disambiguates it' },
				{ tag: 'R from former name', description: 'redirect from a former name or working title' },
				{ tag: 'R from historic name', description: 'redirect from a name with a significant historic past as a region, city, etc. no longer known by that name' },
				{ tag: 'R from incomplete name', description: 'R from incomplete name' },
				{ tag: 'R from incorrect name', description: 'redirect from an erroneus name that is unsuitable as a title' },
				{ tag: 'R from less specific name', description: 'redirect from a less specific title to a more specific, less general one' },
				{ tag: 'R from long name', description: 'redirect from a more complete title' },
				{ tag: 'R from more specific name', description: 'redirect from a more specific title to a less specific, more general one' },
				{ tag: 'R from short name', description: 'redirect from a title that is a shortened form of a person\'s full name, a book title, or other more complete title' },
				{ tag: 'R from sort name', description: 'redirect from the target\'s sort name, such as beginning with their surname rather than given name' },
				{ tag: 'R from synonym', description: 'redirect from a semantic synonym of the target page title' }
			],
			'Người': [
				{ tag: 'R from birth name', description: 'redirect from a person\'s birth name to a more common name' },
				{ tag: 'R from given name', description: 'redirect from a person\'s given name' },
				{ tag: 'R from name with title', description: 'redirect from a person\'s name preceded or followed by a title to the name with no title or with the title in parentheses' },
				{ tag: 'R from person', description: 'redirect from a person or persons to a related article' },
				{ tag: 'R from personal name', description: 'redirect from an individual\'s personal name to an article titled with their professional or other better known moniker' },
				{ tag: 'R from pseudonym', description: 'redirect from a pseudonym' },
				{ tag: 'R from surname', description: 'redirect from a title that is a surname' }
			],
			'Kỹ thuật': [
				{ tag: 'R from drug trade name', description: 'redirect from (or to) the trade name of a drug to (or from) the international nonproprietary name (INN)' },
				{ tag: 'R from filename', description: 'redirect from a title that is a filename of the target' },
				{ tag: 'R from molecular formula', description: 'redirect from a molecular/chemical formula to its technical or trivial name' },
	
				{ tag: 'R from gene symbol', description: 'redirect from a Human Genome Organisation (HUGO) symbol for a gene to an article about the gene' }
			],
			'Sinh vật': [
				{ tag: 'R to scientific name', description: 'redirect from the common name to the scientific name' },
				{ tag: 'R from scientific name', description: 'redirect from the scientific name to the common name' },
				{ tag: 'R from alternative scientific name', description: 'redirect from an alternative scientific name to the accepted scientific name' },
				{ tag: 'R from scientific abbreviation', description: 'redirect from a scientific abbreviation' },
				{ tag: 'R to monotypic taxon', description: 'redirect from the only lower-ranking member of a monotypic taxon to its monotypic taxon' },
				{ tag: 'R from monotypic taxon', description: 'redirect from a monotypic taxon to its only lower-ranking member' },
				{ tag: 'R taxon with possibilities', description: 'redirect from a title related to a living organism that potentially could be expanded into an article' }
			],
			'Địa lý': [
				{ tag: 'R from name and country', description: 'redirect from the specific name to the briefer name' },
				{ tag: 'R from more specific geographic name', description: 'redirect from a geographic location that includes extraneous identifiers such as the county or region of a city' }
			]
		},
		'Navigation aids': {
			'Navigation': [
				{ tag: 'R to anchor', description: 'redirect from a topic that does not have its own page to an anchored part of a page on the subject' },
				{ tag: 'R avoided double redirect', description: 'redirect from an alternative title for another redirect' },
				{ tag: 'R from file metadata link', description: 'redirect of a wikilink created from EXIF, XMP, or other information (i.e. the "metadata" section on some image description pages)' },
				{ tag: 'R to list entry', description: 'redirect to a list which contains brief descriptions of subjects not notable enough to have separate articles' },
	
				{ tag: 'R mentioned in hatnote', description: 'redirect from a title that is mentioned in a hatnote at the redirect target' },
				{ tag: 'R to section', description: 'similar to {{R to list entry}}, but when list is organized in sections, such as list of characters in a fictional universe' },
				{ tag: 'R from shortcut', description: 'redirect from a Wikipedia shortcut' },
				{ tag: 'R from template shortcut', description: 'redirect from a shortcut page name in any namespace to a page in template namespace' }
	
			],
			'Disambiguation': [
				{ tag: 'R from ambiguous term', description: 'redirect from an ambiguous page name to a page that disambiguates it. This template should never appear on a page that has "(disambiguation)" in its title, use R to disambiguation page instead' },
				{ tag: 'R to disambiguation page', description: 'redirect to a disambiguation page' },
				{ tag: 'R from incomplete disambiguation', description: 'redirect from a page name that is too ambiguous to be the title of an article and should redirect to an appropriate disambiguation page' },
				{ tag: 'R from incorrect disambiguation', description: 'redirect from a page name with incorrect disambiguation due to an error or previous editorial misconception' },
				{ tag: 'R from other disambiguation', description: 'redirect from a page name with an alternative disambiguation qualifier' },
				{ tag: 'R from unnecessary disambiguation', description: 'redirect from a page name that has an unneeded disambiguation qualifier' }
			],
			'Merge, duplicate & move': [
				{ tag: 'R from duplicated article', description: 'redirect to a similar article in order to preserve its edit history' },
				{ tag: 'R with history', description: 'redirect from a page containing substantive page history, kept to preserve content and attributions' },
				{ tag: 'R from move', description: 'redirect from a page that has been moved/renamed' },
				{ tag: 'R from merge', description: 'redirect from a merged page in order to preserve its edit history' }
			],
			'Namespace': [
				{ tag: 'R from remote talk page', description: 'redirect from a talk page in any talk namespace to a corresponding page that is more heavily watched' },
				{ tag: 'R to category namespace', description: 'redirect from a page outside the category namespace to a category page' },
				{ tag: 'R to help namespace', description: 'redirect from any page inside or outside of help namespace to a page in that namespace' },
				{ tag: 'R to main namespace', description: 'redirect from a page outside the main-article namespace to an article in mainspace' },
				{ tag: 'R to portal namespace', description: 'redirect from any page inside or outside of portal space to a page in that namespace' },
				{ tag: 'R to project namespace', description: 'redirect from any page inside or outside of project (Wikipedia: or WP:) space to any page in the project namespace' },
				{ tag: 'R to user namespace', description: 'redirect from a page outside the user namespace to a user page (not to a user talk page)' }
			]
		},
		'Media': {
			'Chung': [
				{ tag: 'R from book', description: 'redirect from a book title to a more general, relevant article' },
				{ tag: 'R from album', description: 'redirect from an album to a related topic such as the recording artist or a list of albums' },
				{ tag: 'R from song', description: 'redirect from a song title to a more general, relevant article' },
				{ tag: 'R from television episode', description: 'redirect from a television episode title to a related work or lists of episodes' }
			],
			'Fiction': [
				{ tag: 'R from fictional character', description: 'redirect from a fictional character to a related fictional work or list of characters' },
				{ tag: 'R from fictional element', description: 'redirect from a fictional element (such as an object or concept) to a related fictional work or list of similar elements' },
				{ tag: 'R from fictional location', description: 'redirect from a fictional location or setting to a related fictional work or list of places' }
	
			]
		},
		'Linh tinh': {
			'Thông tin liên quan': [
				{ tag: 'R to article without mention', description: 'đổi hướng đến một bài viết mà không có bất kỳ đề cập nào đến từ hoặc cụm từ được chuyển hướng' },
				{ tag: 'R to decade', description: 'đổi hướng từ một năm đến bài viết theo thập niên' },
				{ tag: 'R from domain name', description: 'đổi hướng từ một tên miền đến một bài viết về một trang web' },
				{ tag: 'R from phrase', description: 'đổi hướng từ một cụm từ đến một bài viết có liên quan chung hơn về chủ đề' },
				{ tag: 'R from list topic', description: 'đổi hướng từ chủ đề của danh sách sang danh sách tương đương' },
				{ tag: 'R from member', description: 'đổi hướng từ một thành viên của một nhóm đến một chủ đề có liên quan, chẳng hạn như nhóm hoặc tổ chức' },
				{ tag: 'R to related topic', description: 'đổi hướng đến một bài viết về một chủ đề tương tự' },
				{ tag: 'R from related word', description: 'đổi hướng từ một từ liên quan' },
				{ tag: 'R from school', description: 'đổi hướng từ một bài báo trường học có rất ít thông tin' },
				{ tag: 'R from subtopic', description: 'đổi hướng từ tiêu đề là chủ đề phụ của bài viết đích' },
				{ tag: 'R to subtopic', description: 'đổi hướng đến một tiêu đề phụ của tiêu đề của chuyển hướng' },
				{ tag: 'R from Unicode character', description: 'đổi hướng từ một ký tự Unicode duy nhất đến một bài viết hoặc trang dự án Wikipedia mang ý nghĩa cho biểu tượng' },
				{ tag: 'R from Unicode code', description: 'đổi hướng từ một điểm mã Unicode đến một bài viết về ký tự mà nó đại diện' }
			],
			'With possibilities': [
				{ tag: 'R with possibilities', description: 'đổi hướng từ một tiêu đề cụ thể đến một bài viết tổng quát hơn, ít chi tiết hơn (một cái gì đó có thể và nên được mở rộng)' }
			],
			'ISO codes': [
				{ tag: 'R from ISO 4 abbreviation', description: 'đổi hướng từ tên viết tắt của tiêu đề ấn phẩm ISO 4 sang tên không được viết tắt' },
				{ tag: 'R from ISO 639 code', description: 'đổi hướng từ tiêu đề là mã ngôn ngữ ISO 639 đến một bài viết về ngôn ngữ' }
			],
			'Printworthiness': [
				{ tag: 'R printworthy', description: 'đổi hướng từ một tiêu đề sẽ hữu ích trong phiên bản in hoặc CD/DVD của Wikipedia' },
				{ tag: 'R unprintworthy', description: 'đổi hướng từ tiêu đề KHÔNG hữu ích trong phiên bản in hoặc CD/DVD của Wikipedia' }
			]
		}
	};
	
	// Khu vực dành cho các nhãn BẢO QUẢN TẬP TIN
	
	Twinkle.tag.fileList = {
		'Các nhãn giấy phép và vấn đề về nguồn': [
			{ label: '{{Yêu cầu nguồn tốt hơn}}: {{Bsr}} -- thông tin nguồn chỉ bao gồm URL hình ảnh/URL cơ sở chung', value: 'Bsr' },
			{ label: '{{Giảm hình không tự do}}: {{Non-free reduce}} -- hình ảnh sử dụng hợp lý (SDHL) có độ phân giải cao (hoặc đoạn âm thanh quá dài, v.v.)', value: 'Non-free reduce' },
			{ label: '{{Tập tin có phiên bản cũ không tự do}}: {{Orphaned non-free revisions}} -- tập tin SDHL cần xóa/ẩn các bản cũ', value: 'Orphaned non-free revisions' }
		],
		'Các nhãn liên quan đến Wikimedia Commons': [
			{ label: '{{Chuyển sang Commons}}: {{Chuyển sang Commons}} -- tập tin tự do cần được chuyển sang Commons', value: 'Copy to Commons' },
			{ label: '{{Đừng chuyển sang Commons}} (vấn đề PD): {{Do not move to Commons}} -- tập tin chưa đủ tự do theo quy định Commons', value: 'Do not move to Commons' },
			{
				label: '{{Đừng chuyển sang Commons}} (lý do khác)',
				value: 'Do not move to Commons_reason',
				subgroup: {
					type: 'input',
					name: 'DoNotMoveToCommons',
					label: 'Lý do: ',
					tooltip: 'Nhập lý do tại sao hình ảnh này không nên chuyển đến Commons (bắt buộc)'
				}
			},
			{
				label: '{{Giữ bản sao địa phương}}: {{Keep local}} -- yêu cầu giữ bản sao địa phương của tập tin Commons',
				value: 'Keep local',
				subgroup: {
					type: 'input',
					name: 'keeplocalName',
					label: 'Tên hình ảnh ở Commons nếu khác: ',
					tooltip: 'Tên của hình ảnh trên Commons (nếu khác với tên địa phương), ngoại trừ tiền tố File:/Tập tin:'
				}
			},
			{
				label: '{{Hiện có tại Commons}}: {{Now Commons}} -- tập tin đã được xuất sang Commons',
				value: 'Now Commons',
				subgroup: {
					type: 'input',
					name: 'nowcommonsName',
					label: 'Tên hình ảnh ở Commons nếu khác: ',
					tooltip: 'Tên của hình ảnh trên Commons (nếu khác với tên địa phương), ngoại trừ tiền tố File:/Tập tin:'
				}
			}
		],
		'Các nhãn dọn dẹp': [
			{ label: '{{Artifacts}}: PNG chứa các nhiễu nén còn sót lại', value: 'Artifacts' },
			{ label: '{{Bad font}}: SVG sử dụng phông chữ không có sẵn trên máy chủ hình thu nhỏ', value: 'Bad font' },
			{ label: '{{Bad format}}: Tệp PDF/DOC/ ... nên được chuyển đổi sang định dạng hữu ích hơn', value: 'Bad format' },
			{ label: '{{Bad GIF}}: GIF nên là PNG, JPEG, hoặc SVG', value: 'Bad GIF' },
			{ label: '{{Bad JPEG}}: JPEG nên là PNG hoặc SVG', value: 'Bad JPEG' },
			{ label: '{{Bad SVG}}: SVG chứa đồ họa raster', value: 'Bad SVG' },
			{ label: '{{Bad trace}}: SVG tự động theo dõi yêu cầu dọn dẹp', value: 'Bad trace' },
			{
				label: '{{Cleanup image}}: dọn dẹp chung', value: 'Cleanup image',
				subgroup: {
					type: 'input',
					name: 'cleanupimageReason',
					label: 'Lý do: ',
					tooltip: 'Nhập lý do cần dọn dẹp (bắt buộc)'
				}
			},
			{ label: '{{ClearType}}: hình ảnh (không phải ảnh chụp màn hình) với tính năng khử răng cưa ClearType', value: 'ClearType' },
			{ label: '{{Watermark}}: {{Imagewatermark}} -- hình ảnh chứa watermarking có thể nhìn thấy hoặc không nhìn thấy', value: 'Imagewatermark' },
			{ label: '{{NoCoins}}: hình ảnh sử dụng tiền xu để biểu thị quy mô', value: 'NoCoins' },
			{ label: '{{Overcompressed JPEG}}: JPEG với mức độ nhiễu cao', value: 'Overcompressed JPEG' },
			{ label: '{{Opaque}}: nền mờ đục phải trong suốt', value: 'Opaque' },
			{ label: '{{Remove border}}: đường viền không cần thiết, khoảng trắng, v.v.', value: 'Remove border' },
			{
				label: '{{Rename media}}: tập tin phải được đổi tên theo tiêu chí tại [[Wikipedia:Trình di chuyển tập tin]] ([[WP:FMV]])',
				value: 'Rename media',
				subgroup: [
					{
						type: 'input',
						name: 'renamemediaNewname',
						label: 'Tên mới: ',
						tooltip: 'Nhập tên mới cho hình ảnh (tùy chọn)'
					},
					{
						type: 'input',
						name: 'renamemediaReason',
						label: 'Lý do: ',
						tooltip: 'Nhập lý do đổi tên (tùy chọn)'
					}
				]
			},
			{ label: '{{Should be PNG}}: GIF hoặc JPEG phải là không mất mát dữ liệu', value: 'Should be PNG' },
			{
				label: '{{SVG}}: {{Should be SVG}} -- PNG, GIF hoặc JPEG phải là đồ họa vector', value: 'Should be SVG',
				subgroup: {
					name: 'svgCategory',
					type: 'select',
					list: [
						{ label: '{{Should be SVG|other}}', value: 'other' },
						{ label: '{{Should be SVG|alphabet}}: hình ảnh ký tự, ví dụ về phông chữ, v.v.', value: 'alphabet' },
						{ label: '{{Should be SVG|chemical}}: sơ đồ hóa học, v.v.', value: 'chemical' },
						{ label: '{{Should be SVG|circuit}}: sơ đồ mạch điện tử, v.v.', value: 'circuit' },
						{ label: '{{Should be SVG|coat of arms}}: huy hiệu', value: 'coat of arms' },
						{ label: '{{Should be SVG|diagram}}: sơ đồ không phù hợp với bất kỳ danh mục con nào khác', value: 'diagram' },
						{ label: '{{Should be SVG|emblem}}: biểu tượng, biểu trưng tự do / viết tắt, phù hiệu, v.v.', value: 'emblem' },
						{ label: '{{Should be SVG|fair use}}: hình ảnh sử dụng hợp lý, biểu trưng sử dụng hợp pháp', value: 'fair use' },
						{ label: '{{Should be SVG|flag}}: lá cờ', value: 'flag' },
						{ label: '{{Should be SVG|graph}}: lô dữ liệu trực quan', value: 'graph' },
						{ label: '{{Should be SVG|logo}}: logo', value: 'logo' },
						{ label: '{{Should be SVG|map}}: bản đồ', value: 'map' },
						{ label: '{{Should be SVG|music}}: thang âm nhạc, nốt nhạc, v.v.', value: 'music' },
						{ label: '{{Should be SVG|physical}}: hình ảnh "thực tế" của các đối tượng vật lý, con người, v.v.', value: 'physical' },
						{ label: '{{Should be SVG|symbol}}: các ký hiệu, biểu tượng khác, v.v.', value: 'symbol' }
					]
				}
			},
			{ label: '{{Nên là văn bản}}: {{Should be text}} -- hình ảnh phải được thể hiện dưới dạng văn bản, bảng hoặc đánh dấu toán học', value: 'Should be text' }
		],
		'Các nhãn chất lượng hình ảnh': [
			{ label: '{{Image hoax}}: Hình ảnh có thể bị thao túng hoặc tạo thành một trò lừa bịp', value: 'Image hoax' },
			{ label: '{{Image-blownout}}', value: 'Image-blownout' },
			{ label: '{{Image-out-of-focus}}', value: 'Image-out-of-focus' },
			{
				label: '{{Image-Poor-Quality}}', value: 'Image-Poor-Quality',
				subgroup: {
					type: 'input',
					name: 'ImagePoorQualityReason',
					label: 'Lý do: ',
					tooltip: 'Nhập lý do tại sao hình ảnh này quá xấu (bắt buộc)'
				}
			},
			{ label: '{{Image-underexposure}}', value: 'Image-underexposure' },
			{
				label: '{{Low quality chem}}: cấu trúc hóa học tranh cãi', value: 'Low quality chem',
				subgroup: {
					type: 'input',
					name: 'lowQualityChemReason',
					label: 'Lý do: ',
					tooltip: 'Nhập lý do tại sao sơ đồ bị tranh cãi (bắt buộc)'
				}
			}
		],
		'Các nhãn thay thế': [
			{ label: '{{Lỗi thời}}: {{Obsolete}} -- phiên bản cải tiến có sẵn', value: 'Obsolete' },
			{ label: '{{Phiên bản PNG có sẵn}}: {{PNG version available}} -- phiên bản PNG có sẵn', value: 'PNG version available' },
			{ label: '{{Phiên bản vector có sẵn}}: {{Vector version available}} -- phiên bản vector có sẵn', value: 'Vector version available' }
		]
	};
	Twinkle.tag.fileList['Các nhãn thay thế'].forEach(function(el) {
		el.subgroup = {
			type: 'input',
			label: 'Tập tin thay thế: ',
			tooltip: 'Nhập tên của tập tin thay thế tập tin này (bắt buộc)',
			name: el.value.replace(/ /g, '_') + 'File'
		};
	});
	
	
	Twinkle.tag.callbacks = {
		article: function articleCallback(pageobj) {
	
			// Remove tags that become superfluous with this action
			var pageText = pageobj.getPageText().replace(/\{\{\s*([Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
			var params = pageobj.getCallbackParameters();
	
			/**
			 * Saves the page following the removal of tags if any. The last step.
			 * Called from removeTags()
			 */
			var postRemoval = function() {
				if (params.tagsToRemove.length) {
					// Remove empty {{multiple issues}} if found
					pageText = pageText.replace(/\{\{(multiple ?issues|article ?issues|mi)\s*\|\s*\}\}\n?/im, '');
					// Remove single-element {{multiple issues}} if found
					pageText = pageText.replace(/\{\{(?:multiple ?issues|article ?issues|mi)\s*\|\s*(\{\{[^}]+\}\})\s*\}\}/im, '$1');
				}
	
				// Build edit summary
				var makeSentence = function(array) {
					if (array.length < 3) {
						return array.join(' và ');
					}
					var last = array.pop();
					return array.join(', ') + ', và ' + last;
				};
				var makeTemplateLink = function(tag) {
					var text = '{{[[';
					// if it is a custom tag with a parameter
					if (tag.indexOf('|') !== -1) {
						tag = tag.slice(0, tag.indexOf('|'));
					}
					text += tag.indexOf(':') !== -1 ? tag : 'Template:' + tag + '|' + tag;
					return text + ']]}}';
				};
	
				var summaryText;
				var addedTags = params.tags.map(makeTemplateLink);
				var removedTags = params.tagsToRemove.map(makeTemplateLink);
				if (addedTags.length) {
					summaryText = 'Đã thêm nhãn ' + makeSentence(addedTags);
					summaryText += removedTags.length ? '; và đã xóa ' + makeSentence(removedTags) : '';
				} else {
					summaryText = 'Đã xóa ' + makeSentence(removedTags);
				}
				//summaryText += (addedTags.length + removedTags.length > 1 ? '' : ''); // không cần
				if (params.reason) {
					summaryText += ': ' + params.reason;
				}
	
				// avoid truncated summaries
				if (summaryText.length > 499) {
					summaryText = summaryText.replace(/\[\[[^|]+\|([^\]]+)\]\]/g, '$1');
				}
	
				pageobj.setPageText(pageText);
				pageobj.setEditSummary(summaryText);
				pageobj.setWatchlist(Twinkle.getPref('watchTaggedPages'));
				pageobj.setMinorEdit(Twinkle.getPref('markTaggedPagesAsMinor'));
				pageobj.setCreateOption('nocreate');
				pageobj.save(function() {
					// special functions for merge tags
					if (params.mergeReason) {
						// post the rationale on the talk page (only operates in main namespace)
						var talkpageText = '\n\n== ' + params.talkDiscussionTitleLinked + ' ==\n\n';
						talkpageText += params.mergeReason.trim() + ' ~~~~';
						var talkpage = new Morebits.wiki.page('Talk:' + params.discussArticle, 'Đăng lý do trên trang thảo luận');
						talkpage.setAppendText(talkpageText);
						talkpage.setEditSummary('/* ' + params.talkDiscussionTitle + ' */ new section');
						talkpage.setChangeTags(Twinkle.changeTags);
						talkpage.setWatchlist(Twinkle.getPref('watchMergeDiscussions'));
						talkpage.setCreateOption('recreate');
						talkpage.append();
					}
					if (params.mergeTagOther) {
						// tag the target page if requested
						var otherTagName = 'Hợp nhất';
						if (params.mergeTag === 'Hợp nhất từ') {
							otherTagName = 'Hợp nhất đến';
						} else if (params.mergeTag === 'Hợp nhất đến') {
							otherTagName = 'Hợp nhất từ';
						}
						var newParams = {
							tags: [otherTagName],
							tagsToRemove: [],
							tagsToRemain: [],
							mergeTarget: Morebits.pageNameNorm,
							discussArticle: params.discussArticle,
							talkDiscussionTitle: params.talkDiscussionTitle,
							talkDiscussionTitleLinked: params.talkDiscussionTitleLinked
						};
						var otherpage = new Morebits.wiki.page(params.mergeTarget, 'Đang gán nhãn trang khác (' +
							params.mergeTarget + ')');
						otherpage.setChangeTags(Twinkle.changeTags);
						otherpage.setCallbackParameters(newParams);
						otherpage.load(Twinkle.tag.callbacks.article);
					}
	
					// post at WP:PNT for {{not English}} and {{rough translation}} tag
					if (params.translationPostAtPNT) {
						var pntPage = new Morebits.wiki.page('Wikipedia:Pages needing translation into English',
							'Listing article at Wikipedia:Pages needing translation into English');
						pntPage.setFollowRedirect(true);
						pntPage.load(function friendlytagCallbacksTranslationListPage(pageobj) {
							var old_text = pageobj.getPageText();
	
							var template = params.tags.indexOf('Rough translation') !== -1 ? 'duflu' : 'needtrans';
							var lang = params.translationLanguage;
							var reason = params.translationComments;
	
							var templateText = '{{subst:' + template + '|pg=' + Morebits.pageNameNorm + '|Language=' +
								(lang || 'uncertain') + '|Comments=' + reason.trim() + '}} ~~~~';
	
							var text, summary;
							if (template === 'duflu') {
								text = old_text + '\n\n' + templateText;
								summary = 'Translation cleanup requested on ';
							} else {
								text = old_text.replace(/\n+(==\s?Translated pages that could still use some cleanup\s?==)/,
									'\n\n' + templateText + '\n\n$1');
								summary = 'Translation' + (lang ? ' from ' + lang : '') + ' requested on ';
							}
	
							if (text === old_text) {
								pageobj.getStatusElement().error('failed to find target spot for the discussion');
								return;
							}
							pageobj.setPageText(text);
							pageobj.setEditSummary(summary + ' [[:' + Morebits.pageNameNorm + ']]');
							pageobj.setChangeTags(Twinkle.changeTags);
							pageobj.setCreateOption('recreate');
							pageobj.save();
						});
					}
					if (params.translationNotify) {
						pageobj.lookupCreation(function(innerPageobj) {
							var initialContrib = innerPageobj.getCreator();
	
							// Disallow warning yourself
							if (initialContrib === mw.config.get('wgUserName')) {
								innerPageobj.getStatusElement().warn('You (' + initialContrib + ') created this page; skipping user notification');
								return;
							}
	
							var userTalkPage = new Morebits.wiki.page('User talk:' + initialContrib,
								'Notifying initial contributor (' + initialContrib + ')');
							var notifytext = '\n\n== Your article [[' + Morebits.pageNameNorm + ']]==\n' +
								'{{subst:uw-notenglish|1=' + Morebits.pageNameNorm +
								(params.translationPostAtPNT ? '' : '|nopnt=yes') + '}} ~~~~';
							userTalkPage.setAppendText(notifytext);
							userTalkPage.setEditSummary('Notice: Please use English when contributing to the English Wikipedia.');
							userTalkPage.setChangeTags(Twinkle.changeTags);
							userTalkPage.setCreateOption('recreate');
							userTalkPage.setFollowRedirect(true, false);
							userTalkPage.append();
						});
					}
				});
	
				if (params.patrol) {
					pageobj.triage();
				}
			};
	
			/**
			 * Removes the existing tags that were deselected (if any)
			 * Calls postRemoval() when done
			 */
			var removeTags = function removeTags() {
	
				if (params.tagsToRemove.length === 0) {
					postRemoval();
					return;
				}
	
				Morebits.status.info('Thông tin', 'Đang xóa các nhãn được bỏ chọn');
	
				var getRedirectsFor = [];
	
				// Remove the tags from the page text, if found in its proper name,
				// otherwise moves it to `getRedirectsFor` array earmarking it for
				// later removal
				params.tagsToRemove.forEach(function removeTag(tag) {
				
					if (tag === 'Chất lượng kém') // Alphama
						tag = 'Chất lượng kém/nguồn';
				
					var tag_re = new RegExp('\\{\\{' + Morebits.pageNameRegex(tag) + '\\s*(\\|[^}]+)?\\}\\}\\n?');
					
	
					if (tag_re.test(pageText)) {
						pageText = pageText.replace(tag_re, '');
					} else {
						getRedirectsFor.push('Template:' + tag);
					}
				});
	
				if (!getRedirectsFor.length) {
					postRemoval();
					return;
				}
	
				// Remove tags which appear in page text as redirects
				var api = new Morebits.wiki.api('Đang lấy các chuyển hướng mẫu', {
					action: 'query',
					prop: 'linkshere',
					titles: getRedirectsFor.join('|'),
					redirects: 1,  // follow redirect if the class name turns out to be a redirect page
					lhnamespace: '10',  // template namespace only
					lhshow: 'redirect',
					lhlimit: 'max', // 500 is max for normal users, 5000 for bots and sysops
					format: 'json'
				}, function removeRedirectTag(apiobj) {
					var pages = apiobj.getResponse().query.pages.filter(function(p) {
						return !p.missing && !!p.linkshere;
					});
					pages.forEach(function(page) {
						var removed = false;
						page.linkshere.forEach(function(el) {
							var tag = el.title.slice(9);
							var tag_re = new RegExp('\\{\\{' + Morebits.pageNameRegex(tag) + '\\s*(\\|[^}]*)?\\}\\}\\n?');
							if (tag_re.test(pageText)) {
								pageText = pageText.replace(tag_re, '');
								removed = true;
								return false;   // break out of $.each
							}
						});
						if (!removed) {
							Morebits.status.warn('Thông tin', 'Không tìm thấy {{' +
							page.title.slice(9) + '}} trong trang... đang loại bỏ');
						}
	
					});
	
					postRemoval();
	
				});
				api.post();
	
			};
	
			if (!params.tags.length) {
				removeTags();
				return;
			}
	
			var tagRe, tagText = '', tags = [], groupableTags = [], groupableExistingTags = [];
			// Executes first: addition of selected tags
	
			/**
			 * Updates `tagText` with the syntax of `tagName` template with its parameters
			 * @param {number} tagIndex
			 * @param {string} tagName
			 */
			var addTag = function articleAddTag(tagIndex, tagName) {
				var currentTag = '';
				if (tagName === 'Chưa phân loại' || tagName === 'Cải thiện thể loại') {
					pageText += '\n\n{{' + tagName + '|date={{subst:CURRENTMONTHNAME}}/{{subst:CURRENTYEAR}}}}';
				} else {
					currentTag += '{{' + tagName;
					// fill in other parameters, based on the tag
					switch (tagName) {
						case 'Chất lượng kém':
							if (params.cleanup === '')
								params.cleanup = 'Chưa có lý do';
							currentTag = '{{thế:' + tagName;	
							currentTag += '|lý do=' + params.cleanup;
							break;
						case 'Cần dọn dẹp':
							if (params.cleanup === '')
								params.cleanup = 'Chưa có lý do';
							currentTag += '|reason=' + params.cleanup;
							break;
						case 'Close paraphrasing':
							currentTag += '|source=' + params.closeParaphrasing;
							break;
						case 'Biên tập':
							if (params.copyEdit) {
								currentTag += '|for=' + params.copyEdit;
							}
							break;
						case 'Chép dán':
							if (params.copypaste) {
								currentTag += '|url=' + params.copypaste;
							}
							break;
						case 'Mở rộng ngôn ngữ':
							currentTag += '|topic=';
							currentTag += '|langcode=' + params.expandLanguageLangCode;
							if (params.expandLanguageArticle !== null) {
								currentTag += '|otherarticle=' + params.expandLanguageArticle;
							}
							break;
						case 'Expert needed':
							if (params.expertNeeded) {
								currentTag += '|1=' + params.expertNeeded;
							}
							if (params.expertNeededTalk) {
								currentTag += '|talk=' + params.expertNeededTalk;
							}
							if (params.expertNeededReason) {
								currentTag += '|reason=' + params.expertNeededReason;
							}
							break;
						case 'Tầm nhìn hẹp':
							currentTag += '|1=bài viết';
							if (params.globalizeRegion) {
								currentTag += '|2=' + params.globalizeRegion;
							}
							break;
						case 'News release':
							currentTag += '|1=article';
							break;
						case 'Không nổi bật':
							if (params.notability !== 'none') {
								currentTag += '|' + params.notability;
							}
							break;
						case 'Not English':
						case 'Rough translation':
							if (params.translationLanguage) {
								currentTag += '|1=' + params.translationLanguage;
							}
							if (params.translationPostAtPNT) {
								currentTag += '|listed=yes';
							}
							break;
						case 'History merge':
							currentTag += '|originalpage=' + params.histmergeOriginalPage;
							if (params.histmergeReason) {
								currentTag += '|reason=' + params.histmergeReason;
							}
							if (params.histmergeSysopDetails) {
								currentTag += '|details=' + params.histmergeSysopDetails;
							}
							break;
						case 'Hợp nhất':
						case 'Hợp nhất đến':
						case 'Hợp nhất từ':
							params.mergeTag = tagName;
							// normalize the merge target for now and later
							params.mergeTarget = Morebits.string.toUpperCaseFirstChar(params.mergeTarget.replace(/_/g, ' '));
	
							currentTag += '|' + params.mergeTarget;
	
							// link to the correct section on the talk page, for article space only
							if (mw.config.get('wgNamespaceNumber') === 0 && (params.mergeReason || params.discussArticle)) {
								if (!params.discussArticle) {
									// discussArticle is the article whose talk page will contain the discussion
									params.discussArticle = tagName === 'Hợp nhất đến' ? params.mergeTarget : mw.config.get('wgTitle');
									// nonDiscussArticle is the article which won't have the discussion
									params.nonDiscussArticle = tagName === 'Hợp nhất đến' ? mw.config.get('wgTitle') : params.mergeTarget;
									var direction = '[[' + params.nonDiscussArticle + ']]' + (params.mergeTag === 'Hợp nhất' ? ' với ' : ' vào ') + '[[' + params.discussArticle + ']]';
									params.talkDiscussionTitleLinked = 'Đề xuất hợp nhất ' + direction;
									params.talkDiscussionTitle = params.talkDiscussionTitleLinked.replace(/\[\[(.*?)\]\]/g, '$1');
								}
								currentTag += '|discuss=Talk:' + params.discussArticle + '#' + params.talkDiscussionTitle;
							}
							break;
						default:
							break;
					}
	
					currentTag += '|date={{subst:CURRENTMONTHNAME}}/{{subst:CURRENTYEAR}}}}\n';
					tagText += currentTag;
				}
			};
	
			/**
			 * Adds the tags which go outside {{multiple issues}}, either because
			 * these tags aren't supported in {{multiple issues}} or because
			 * {{multiple issues}} is not being added to the page at all
			 */
			var addUngroupedTags = function() {
				$.each(tags, addTag);
	
				// Insert tag after short description or any hatnotes,
				// as well as deletion/protection-related templates
				var wikipage = new Morebits.wikitext.page(pageText);
				var templatesAfter = Twinkle.hatnoteRegex +
					// Protection templates
					'pp|pp-.*?|' +
					// CSD
					'db|delete|db-.*?|speedy deletion-.*?|' +
					// PROD
					'(?:proposed deletion|prod blp)\\/dated(?:\\s*\\|(?:concern|user|timestamp|help).*)+|' +
					// not a hatnote, but sometimes under a CSD or AfD
					'salt|proposed deletion endorsed';
				// AfD is special, as the tag includes html comments before and after the actual template
				// trailing whitespace/newline needed since this subst's a newline
				var afdRegex = '(?:<!--.*AfD.*\\n\\{\\{(?:Article for deletion\\/dated|AfDM).*\\}\\}\\n<!--.*(?:\\n<!--.*)?AfD.*(?:\\s*\\n))?';
				pageText = wikipage.insertAfterTemplates(tagText, templatesAfter, null, afdRegex).getText();
	
				removeTags();
			};
	
			// Separate tags into groupable ones (`groupableTags`) and non-groupable ones (`tags`)
			params.tags.forEach(function(tag) {
				tagRe = new RegExp('\\{\\{' + tag + '(\\||\\}\\})', 'im');
				// regex check for preexistence of tag can be skipped if in canRemove mode
				if (Twinkle.tag.canRemove || !tagRe.exec(pageText)) {
					// condition Twinkle.tag.article.tags[tag] to ensure that its not a custom tag
					// Custom tags are assumed non-groupable, since we don't know whether MI template supports them
					if (Twinkle.tag.article.flatObject[tag] && !Twinkle.tag.article.flatObject[tag].excludeMI) {
						groupableTags.push(tag);
					} else {
						tags.push(tag);
					}
				} else {
					if (tag === 'Hợp nhất từ' || tag === 'History merge') {
						tags.push(tag);
					} else {
						Morebits.status.warn('Thông tin', 'Đã tìm thấy {{' + tag +
							'}} trong bài viết ... loại trừ');
						// don't do anything else with merge tags
						if (['Hợp nhất', 'Hợp nhất đến'].indexOf(tag) !== -1) {
							params.mergeTarget = params.mergeReason = params.mergeTagOther = null;
						}
					}
				}
			});
	
			// To-be-retained existing tags that are groupable
			params.tagsToRemain.forEach(function(tag) {
				if (!Twinkle.tag.article.flatObject[tag].excludeMI) {
					groupableExistingTags.push(tag);
				}
			});
	
			var miTest = /\{\{(multiple ?issues|article ?issues|mi)(?!\s*\|\s*section\s*=)[^}]+\{/im.exec(pageText);
	
			if (miTest && groupableTags.length > 0) {
				Morebits.status.info('Thông tin', 'Thêm các nhãn được hỗ trợ bên trong nhãn {{multiple issues}} (nhiều vấn đề)');
	
				tagText = '';
				$.each(groupableTags, addTag);
	
				var miRegex = new RegExp('(\\{\\{\\s*' + miTest[1] + '\\s*(?:\\|(?:\\{\\{[^{}]*\\}\\}|[^{}])*)?)\\}\\}\\s*', 'im');
				pageText = pageText.replace(miRegex, '$1' + tagText + '}}\n');
				tagText = '';
	
				addUngroupedTags();
	
			} else if (params.group && !miTest && (groupableExistingTags.length + groupableTags.length) >= 2) {
				Morebits.status.info('Thông tin', 'Gom nhóm các nhãn được hỗ trợ bên trong nhãn {{multiple issues}} (nhiều vấn đề)');
	
				tagText += '{{Nhiều vấn đề|\n';
	
				/**
				 * Adds newly added tags to MI
				 */
				var addNewTagsToMI = function() {
					$.each(groupableTags, addTag);
					tagText += '}}\n';
	
					addUngroupedTags();
				};
	
	
				var getRedirectsFor = [];
	
				// Reposition the tags on the page into {{multiple issues}}, if found with its
				// proper name, else moves it to `getRedirectsFor` array to be handled later
				groupableExistingTags.forEach(function repositionTagIntoMI(tag) {
					var tag_re = new RegExp('(\\{\\{' + Morebits.pageNameRegex(tag) + '\\s*(\\|[^}]+)?\\}\\}\\n?)');
					if (tag_re.test(pageText)) {
						tagText += tag_re.exec(pageText)[1];
						pageText = pageText.replace(tag_re, '');
					} else {
						getRedirectsFor.push('Template:' + tag);
					}
				});
	
				if (!getRedirectsFor.length) {
					addNewTagsToMI();
					return;
				}
	
				var api = new Morebits.wiki.api('Đang lấy các chuyển hướng bản mẫu', {
					'action': 'query',
					'prop': 'linkshere',
					'titles': getRedirectsFor.join('|'),
					'redirects': 1,
					'lhnamespace': '10', // template namespace only
					'lhshow': 'redirect',
					'lhlimit': 'max' // 500 is max for normal users, 5000 for bots and sysops
				}, function replaceRedirectTag(apiobj) {
					$(apiobj.responseXML).find('page').each(function(idx, page) {
						var found = false;
						$(page).find('lh').each(function(idx, el) {
							var tag = $(el).attr('title').slice(9);
							var tag_re = new RegExp('(\\{\\{' + Morebits.pageNameRegex(tag) + '\\s*(\\|[^}]*)?\\}\\}\\n?)');
							if (tag_re.test(pageText)) {
								tagText += tag_re.exec(pageText)[1];
								pageText = pageText.replace(tag_re, '');
								found = true;
								return false;   // break out of $.each
							}
						});
						if (!found) {
							Morebits.status.warn('Thông tin', 'Không tìm thấy hiện có {{' +
							$(page).attr('title').slice(9) + '}} ở trang... bỏ qua sắp đặt lại');
						}
					});
					addNewTagsToMI();
				});
				api.post();
	
			} else {
				tags = tags.concat(groupableTags);
				addUngroupedTags();
			}
		},
	
		redirect: function redirect(pageobj) {
			var params = pageobj.getCallbackParameters(),
				pageText = pageobj.getPageText(),
				tagRe, tagText = '', summaryText = 'Đã thêm',
				tags = [], i;
	
			for (i = 0; i < params.tags.length; i++) {
				tagRe = new RegExp('(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im');
				if (!tagRe.exec(pageText)) {
					tags.push(params.tags[i]);
				} else {
					Morebits.status.warn('Thông tin', 'Đã tìm thấy {{' + params.tags[i] +
						'}} on the redirect already...excluding');
				}
			}
	
			var addTag = function redirectAddTag(tagIndex, tagName) {
				tagText += '\n{{' + tagName;
				if (tagName === 'R from alternative language') {
					if (params.altLangFrom) {
						tagText += '|from=' + params.altLangFrom;
					}
					if (params.altLangTo) {
						tagText += '|to=' + params.altLangTo;
					}
				}
				tagText += '}}';
	
				if (tagIndex > 0) {
					if (tagIndex === (tags.length - 1)) {
						summaryText += ' và';
					} else if (tagIndex < (tags.length - 1)) {
						summaryText += ',';
					}
				}
	
				summaryText += ' {{[[:' + (tagName.indexOf(':') !== -1 ? tagName : 'Template:' + tagName + '|' + tagName) + ']]}}';
			};
	
			if (!tags.length) {
				Morebits.status.warn('Thông tin', 'Không có nhãn nào để áp dụng');
			}
	
			tags.sort();
			$.each(tags, addTag);
	
			// Check for all Rcat shell redirects (from #433)
			if (pageText.match(/{{(?:redr|this is a redirect|r(?:edirect)?(?:.?cat.*)?[ _]?sh)/i)) {
				// Regex inspired by [[User:Kephir/gadgets/sagittarius.js]] ([[Special:PermaLink/831402893]])
				var oldTags = pageText.match(/(\s*{{[A-Za-z ]+\|)((?:[^|{}]*|{{[^}]*}})+)(}})\s*/i);
				pageText = pageText.replace(oldTags[0], oldTags[1] + tagText + oldTags[2] + oldTags[3]);
			} else {
				// Fold any pre-existing Rcats into taglist and under Rcatshell
				var pageTags = pageText.match(/\s*{{R(?:edirect)? .*?}}/img);
				var oldPageTags = '';
				if (pageTags) {
					pageTags.forEach(function(pageTag) {
						var pageRe = new RegExp(pageTag, 'img');
						pageText = pageText.replace(pageRe, '');
						pageTag = pageTag.trim();
						oldPageTags += '\n' + pageTag;
					});
				}
				pageText += '\n{{Redirect category shell|' + tagText + oldPageTags + '\n}}';
			}
	
			summaryText += (tags.length > 0 ? ' tag' + (tags.length > 1 ? 's' : ' ') : 'rcat shell') + ' to redirect';
	
			// avoid truncated summaries
			if (summaryText.length > 499) {
				summaryText = summaryText.replace(/\[\[[^|]+\|([^\]]+)\]\]/g, '$1');
			}
	
			pageobj.setPageText(pageText);
			pageobj.setEditSummary(summaryText);
			pageobj.setWatchlist(Twinkle.getPref('watchTaggedPages'));
			pageobj.setMinorEdit(Twinkle.getPref('markTaggedPagesAsMinor'));
			pageobj.setCreateOption('nocreate');
			pageobj.save();
	
			if (params.patrol) {
				pageobj.triage();
			}
	
		},
	
		file: function friendlytagCallbacksFile(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();
			var summary = 'Đang thêm ';
	
			// Add maintenance tags
			if (params.tags.length) {
	
				var tagtext = '', currentTag;
				$.each(params.tags, function(k, tag) {
					// when other commons-related tags are placed, remove "move to Commons" tag
					if (['Keep local', 'Now Commons', 'Do not move to Commons_reason', 'Do not move to Commons'].indexOf(tag) !== -1) {
						text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');
					}
	
					currentTag = tag === 'Do not move to Commons_reason' ? 'Do not move to Commons' : tag;
	
					switch (tag) {
						case 'Now Commons':
							currentTag = 'subst:' + currentTag; // subst
							if (params.nowcommonsName !== '') {
								currentTag += '|1=' + params.nowcommonsName;
							}
							break;
						case 'Keep local':
							if (params.keeplocalName !== '') {
								currentTag += '|1=' + params.keeplocalName;
							}
							break;
						case 'Rename media':
							if (params.renamemediaNewname !== '') {
								currentTag += '|1=' + params.renamemediaNewname;
							}
							if (params.renamemediaReason !== '') {
								currentTag += '|2=' + params.renamemediaReason;
							}
							break;
						case 'Cleanup image':
							currentTag += '|1=' + params.cleanupimageReason;
							break;
						case 'Image-Poor-Quality':
							currentTag += '|1=' + params.ImagePoorQualityReason;
							break;
						case 'Image hoax':
							currentTag += '|date={{subst:CURRENTMONTHNAME}}/{{subst:CURRENTYEAR}}';
							break;
						case 'Low quality chem':
							currentTag += '|1=' + params.lowQualityChemReason;
							break;
						case 'Vector version available':
							text = text.replace(/\{\{((convert to |convertto|should be |shouldbe|to)?svg|badpng|vectorize)[^}]*\}\}/gi, '');
							/* falls through */
						case 'PNG version available':
							/* falls through */
						case 'Obsolete':
							currentTag += '|1=' + params[tag.replace(/ /g, '_') + 'File'];
							break;
						case 'Do not move to Commons_reason':
							currentTag += '|reason=' + params.DoNotMoveToCommons;
							break;
						case 'Orphaned non-free revisions':
							currentTag = 'subst:' + currentTag; // subst
							// remove {{non-free reduce}} and redirects
							text = text.replace(/\{\{\s*(Template\s*:\s*)?(Non-free reduce|FairUseReduce|Fairusereduce|Fair Use Reduce|Fair use reduce|Reduce size|Reduce|Fair-use reduce|Image-toobig|Comic-ovrsize-img|Non-free-reduce|Nfr|Smaller image|Nonfree reduce)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, '');
							currentTag += '|date={{subst:date}}';
							break;
						case 'Copy to Commons':
							currentTag += '|human=' + mw.config.get('wgUserName');
							break;
						case 'Should be SVG':
							currentTag += '|' + params.svgCategory;
							break;
						default:
							break;  // don't care
					}
	
					currentTag = '{{' + currentTag + '}}\n';
	
					tagtext += currentTag;
					summary += '{{' + tag + '}}, ';
				});
	
				if (!tagtext) {
					pageobj.getStatusElement().warn('Người dùng đã hủy thao tác; không có gì để thực hiện');
					return;
				}
	
				text = tagtext + text;
			}
	
			pageobj.setPageText(text);
			pageobj.setEditSummary(summary.substring(0, summary.length - 2));
			pageobj.setChangeTags(Twinkle.changeTags);
			pageobj.setWatchlist(Twinkle.getPref('watchTaggedPages'));
			pageobj.setMinorEdit(Twinkle.getPref('markTaggedPagesAsMinor'));
			pageobj.setCreateOption('nocreate');
			pageobj.save();
	
			if (params.patrol) {
				pageobj.triage();
			}
		}
	};
	
	Twinkle.tag.callback.evaluate = function friendlytagCallbackEvaluate(e) {
		var form = e.target;
		var params = Morebits.quickForm.getInputData(form);
	
	
		// Validation
	
		// Given an array of incompatible tags, check if we have two or more selected
		var checkIncompatible = function(conflicts, extra) {
			var count = conflicts.reduce(function(sum, tag) {
				return sum += params.tags.indexOf(tag) !== -1;
			}, 0);
			if (count > 1) {
				var message = 'Vui lòng chỉ chọn một trong số: {{' + conflicts.join('}}, {{') + '}}.';
				message += extra ? ' ' + extra : '';
				alert(message);
				return true;
			}
		};
		// Given a tag, ensure an associate parameter is present
		// Maybe just sock this away in each function???
		var checkParameter = function(tag, parameter, description) {
			description = description || 'một lý do';
			if (params.tags.indexOf(tag) !== -1 && params[parameter].trim() === '') {
				alert('Bạn phải mô tả ' + description + ' cho nhãn {{' + tag + '}}.');
				return true;
			}
		};
	
		// We could theoretically put them all checkIncompatible calls in a
		// forEach loop, but it's probably clearer not to have [[array one],
		// [array two]] devoid of context. Likewise, all the checkParameter
		// calls could be in one if, but could be similarly confusing.
		switch (Twinkle.tag.mode) {
			case 'article':
				params.tagsToRemove = form.getUnchecked('existingTags'); // not in `input`
				params.tagsToRemain = params.existingTags || []; // container not created if none present
	
				if ((params.tags.indexOf('Hợp nhất') !== -1) || (params.tags.indexOf('Hợp nhất từ') !== -1) ||
					(params.tags.indexOf('Hợp nhất đến') !== -1)) {
					if (checkIncompatible(['Hợp nhất', 'Hợp nhất từ', 'Hợp nhất đến'], 'If several merges are required, use {{Merge}} and separate the article names with pipes (although in this case Twinkle cannot tag the other articles automatically).')) {
						return;
					}
					if (!params.mergeTarget) {
						alert('Vui lòng chỉ định tiêu đề của bài viết khác để sử dụng trong bản mẫu hợp nhất.');
						return;
					}
					if ((params.mergeTagOther || params.mergeReason) && params.mergeTarget.indexOf('|') !== -1) {
						alert('Tagging multiple articles in a merge, and starting a discussion for multiple articles, is not supported at the moment. Please turn off "tag other article", and/or clear out the "reason" box, and try again.');
						return;
					}
				}
	
				if (checkIncompatible(['Not English', 'Rough translation'])) {
					return;
				}
				if (checkParameter('History merge', 'histmergeOriginalPage', 'a page to be merged')) {
					return;
				}
				if (checkParameter('Cleanup', 'cleanup')) {
					return;
				}
				if (checkParameter('Expand language', 'expandLanguageLangCode', 'a language code')) {
					return;
				}
				break;
	
			case 'file':
				if (checkIncompatible(['Bad GIF', 'Bad JPEG', 'Bad SVG', 'Bad format'])) {
					return;
				}
				if (checkIncompatible(['Should be PNG', 'Should be SVG', 'Should be text'])) {
					return;
				}
				if (checkIncompatible(['Bad SVG', 'Vector version available'])) {
					return;
				}
				if (checkIncompatible(['Bad JPEG', 'Overcompressed JPEG'])) {
					return;
				}
				if (checkIncompatible(['PNG version available', 'Vector version available'])) {
					return;
				}
	
				// Get extension from either mime-type or title, if not present (e.g., SVGs)
				var extension = ((extension = $('.mime-type').text()) && extension.split(/\//)[1]) || mw.Title.newFromText(Morebits.pageNameNorm).getExtension();
				if (extension) {
					var extensionUpper = extension.toUpperCase();
					// What self-respecting file format has *two* extensions?!
					if (extensionUpper === 'JPG') {
						extension = 'JPEG';
					}
	
					// Check that selected templates make sense given the file's extension.
	
					// Bad GIF|JPEG|SVG
					var badIndex; // Keep track of where the offending template is so we can reference it below
					if ((extensionUpper !== 'GIF' && ((badIndex = params.tags.indexOf('Bad GIF')) !== -1)) ||
						(extensionUpper !== 'JPEG' && ((badIndex = params.tags.indexOf('Bad JPEG')) !== -1)) ||
						(extensionUpper !== 'SVG' && ((badIndex = params.tags.indexOf('Bad SVG')) !== -1))) {
						var suggestion = 'Đây dường như là một ' + extension + ' tập tin, ';
						if (['GIF', 'JPEG', 'SVG'].indexOf(extensionUpper) !== -1) {
							suggestion += 'vui lòng sử dụng {{Bad ' + extensionUpper + '}}.';
						} else {
							suggestion += 'vì vậy {{' + params.tags[badIndex] + '}} không phù hợp.';
						}
						alert(suggestion);
						return;
					}
					// Should be PNG|SVG
					if ((params.tags.toString().indexOf('Should be ') !== -1) && (params.tags.indexOf('Should be ' + extensionUpper) !== -1)) {
						alert('Đây đã là một ' + extension + ' tập tin, vì vậy {{Should be ' + extensionUpper + '}} không phù hợp.');
						return;
					}
	
					// Overcompressed JPEG
					if (params.tags.indexOf('Overcompressed JPEG') !== -1 && extensionUpper !== 'JPEG') {
						alert('Đây dường như là một ' + extension + ' tập tin, vì vậy {{Overcompressed JPEG}} có lẽ không áp dụng.');
						return;
					}
					// Bad trace and Bad font
					if (extensionUpper !== 'SVG') {
						if (params.tags.indexOf('Bad trace') !== -1) {
							alert('Đây dường như là một ' + extension + ' tập tin, vì vậy {{Bad trace}} có lẽ không áp dụng.');
							return;
						} else if (params.tags.indexOf('Bad font') !== -1) {
							alert('Đây dường như là một ' + extension + ' tập tin, vì vậy {{Bad font}} có lẽ không áp dụng.');
							return;
						}
					}
				}
	
				if (checkParameter('Cleanup image', 'cleanupimageReason')) {
					return;
				}
				if (checkParameter('Image-Poor-Quality', 'ImagePoorQualityReason')) {
					return;
				}
				if (checkParameter('Low Quality Chem', 'lowQualityChemReason')) {
					return;
				}
				// Silly to provide the same string to each of these
				if (checkParameter('Obsolete', 'ObsoleteFile', 'the replacement file name') ||
					checkParameter('PNG version available', 'PNG_version_availableFile', 'the replacement file name') ||
					checkParameter('Vector version available', 'Vector_version_availableFile', 'the replacement file name')) {
					return;
				}
				if (checkParameter('Do not move to Commons_reason', 'DoNotMoveToCommons')) {
					return;
				}
				break;
	
			case 'redirect':
				break;
	
			default:
				var temp_mode = Twinkle.tag.mode === 'article'?'bài viết':'trang đổi hướng hoặc tập tin'; // Alphama
				alert('Twinkle.tag: không rõ chế độ ' + temp_mode);
				break;
		}
	
		// File/redirect: return if no tags selected
		// Article: return if no tag is selected and no already present tag is deselected
		if (params.tags.length === 0 && (Twinkle.tag.mode !== 'article' || params.tagsToRemove.length === 0)) {
			alert('Bạn phải chọn ít nhất một nhãn!');
			return;
		}
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);
	
		Morebits.wiki.actionCompleted.redirect = Morebits.pageNameNorm;
		Morebits.wiki.actionCompleted.notice = 'Gán nhãn thành công, hãy tải lại bài viết sau vài giây';
		if (Twinkle.tag.mode === 'redirect') {
			Morebits.wiki.actionCompleted.followRedirect = false;
		}
	
		var temp_mode = Twinkle.tag.mode === 'article'?'bài viết':'trang đổi hướng hoặc tập tin'; // Alphama
		var wikipedia_page = new Morebits.wiki.page(Morebits.pageNameNorm, 'Đang gán nhãn ' + temp_mode); 
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.setChangeTags(Twinkle.changeTags); // Here to apply to triage
		wikipedia_page.load(Twinkle.tag.callbacks[Twinkle.tag.mode]);
	
	};
	
	Twinkle.addInitCallback(Twinkle.tag, 'gán nhãn (thẻ)');
	})(jQuery);
	// </nowiki>
	