// <nowiki>


(function($) {


	/*
		****************************************
		*** twinklexfd.js: XFD module
		****************************************
		* Mode of invocation:     Tab ("XFD")
		* Active on:              Existing, non-special pages, except for file pages with no local (non-Commons) file which are not redirects
		*/
	
	Twinkle.xfd = function twinklexfd() {
		// Disable on:
		// * special pages
		// * non-existent pages
		// * files on Commons, whether there is a local page or not (unneeded local pages of files on Commons are eligible for CSD F2, or R4 if it's a redirect)
		if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId') || (mw.config.get('wgNamespaceNumber') === 6 && document.getElementById('mw-sharedupload'))) {
			return;
		}
	
		Twinkle.addPortletLink(Twinkle.xfd.callback, 'Biểu quyết xóa', 'tw-xfd', 'Bắt đầu một biểu quyết xóa');
	};
	
	
	var utils = {
		/** Get ordinal number figure */
		num2order: function(num) {
			switch (num) {
				case 1: return '';
				case 2: return '2';
				case 3: return '3';
				default: return num + '';
			}
		},
	
		/**
		 * Remove namespace name from title if present
		 * Exception-safe wrapper around mw.Title
		 * @param {string} title
		 */
		stripNs: function(title) {
			var title_obj = mw.Title.newFromUserInput(title);
			if (!title_obj) {
				return title; // user entered invalid input; do nothing
			}
			return title_obj.getNameText();
		},
	
		/**
		 * Add namespace name to page title if not already given
		 * CAUTION: namespace name won't be added if a namespace (*not* necessarily
		 * the same as the one given) already is there in the title
		 * @param {string} title
		 * @param {number} namespaceNumber
		 */
		addNs: function(title, namespaceNumber) {
			var title_obj = mw.Title.newFromUserInput(title, namespaceNumber);
			if (!title_obj) {
				return title;  // user entered invalid input; do nothing
			}
			return title_obj.toText();
		},
	
		/**
		 * Provide Wikipedian TLA style: AfD, RfD, CfDS, RM, SfD, etc.
		 * @param {string} venue
		 * @returns {string}
		 */
		toTLACase: function(venue) {
			return venue
				.toString()
				// Everybody up, inclduing rm and the terminal s in cfds
				.toUpperCase()
				// Lowercase the central f in a given TLA and normalize sfd-t and sfr-t
				.replace(/(.)F(.)(?:-.)?/, '$1f$2');
		}
	};
	
	Twinkle.xfd.currentRationale = null;
	
	// error callback on Morebits.status.object
	Twinkle.xfd.printRationale = function twinklexfdPrintRationale() {
		if (Twinkle.xfd.currentRationale) {
			Morebits.status.printUserText(Twinkle.xfd.currentRationale, 'Lý do xóa của bạn được cung cấp bên dưới, bạn có thể sao chép và dán vào hộp thoại "Biểu quyết xóa" mới nếu bạn muốn thử lại:');
			// only need to print the rationale once
			Twinkle.xfd.currentRationale = null;
		}
	};
	
	Twinkle.xfd.callback = function twinklexfdCallback() {
		var Window = new Morebits.simpleWindow(700, 400);
		Window.setTitle('Bắt đầu một cuộc biểu quyết xóa (XFD))');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Biểu quyết xóai', 'WP:XFD');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#XFD');
	
		var form = new Morebits.quickForm(Twinkle.xfd.callback.evaluate);
		var categories = form.append({
			type: 'select',
			name: 'venue',
			label: 'Không gian biểu quyết xóa:',
			tooltip: 'Khi mở menu biểu quyết xóa, Twinkle sẽ dựa trên không gian tên trang hiện tại để chọn không gian cho biểu quyết xóa.',
			event: Twinkle.xfd.callback.change_category
		});
		var namespace = mw.config.get('wgNamespaceNumber');
	
		categories.append({
			type: 'option',
			label: 'AfD (Biểu quyết xóa bài)',
			selected: namespace === 0,  // Main namespace
			value: 'afd'
		});
		
		// viwiki chưa có
		/*categories.append({
			type: 'option',
			label: 'TfD (Thảo luận xóa bản mẫu)',
			selected: [ 10, 828 ].indexOf(namespace) !== -1,  // Template and module namespaces
			value: 'tfd'
		});*/
		
		categories.append({
			type: 'option',
			label: 'FfD (Biểu quyết xóa tập tin)',
			selected: namespace === 6,  // File namespace
			value: 'ffd'
		});
		
		// viwiki chưa có
		/*categories.append({
			type: 'option',
			label: 'CfD (Biểu quyết xóa thể loại)',
			selected: namespace === 14 || (namespace === 10 && /-stub$/.test(Morebits.pageNameNorm)),  // Category namespace and stub templates
			value: 'cfd'
		});*/
		
		// viwiki chưa có
		/*categories.append({
			type: 'option',
			label: 'CfD/S (Các thể loại dành cho đổi tên nhanh)',
			value: 'cfds'
		});*/
		
		// viwiki chưa có
		/*categories.append({
			type: 'option',
			label: 'MfD (Thảo luận xóa các vấn đề khác)',
			selected: [ 0, 6, 10, 14, 828 ].indexOf(namespace) === -1 || Morebits.pageNameNorm.indexOf('Template:User ', 0) === 0,
			// Other namespaces, and userboxes in template namespace
			value: 'mfd'
		});*/
		
		// viwiki chưa có
		/*categories.append({
			type: 'option',
			label: 'RfD (Thảo luận đổi hướng)',
			selected: Morebits.wiki.isPageRedirect(),
			value: 'rfd'
		});*/
		
		categories.append({
			type: 'option',
			label: 'RM (Yêu cầu di chuyển trang)',
			selected: false,
			value: 'rm'
		});
	
		form.append({
			type: 'div',
			id: 'wrong-venue-warn',
			style: 'color: red; font-style: italic'
		});
	
		form.append({
			type: 'checkbox',
			list: [
				{
					label: 'Thông báo cho người tạo trang nếu có thể',
					value: 'notify',
					name: 'notifycreator',
					tooltip: "Nếu bạn chọn, người tạo trang sẽ được thông báo về biểu quyết xóa.",
					checked: true
				}
			]
		});
		form.append({
			type: 'field',
			label: 'Khu vực làm việc',
			name: 'work_area'
		});
	
		var previewlink = document.createElement('a');
		$(previewlink).click(function() {
			Twinkle.xfd.callbacks.preview(result);  // |result| is defined below
		});
		previewlink.style.cursor = 'pointer';
		previewlink.textContent = 'Xem trước';
		form.append({ type: 'div', id: 'xfdpreview', label: [ previewlink ] });
		form.append({ type: 'div', id: 'twinklexfd-previewbox', style: 'display: none' });
	
		form.append({ type: 'submit' });
	
		var result = form.render();
		Window.setContent(result);
		Window.display();
		result.previewer = new Morebits.wiki.preview($(result).find('div#twinklexfd-previewbox').last()[0]);
	
		// We must init the controls
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.venue.dispatchEvent(evt);
	};
	
	Twinkle.xfd.callback.wrongVenueWarning = function twinklexfdWrongVenueWarning(venue) {
		var text = '';
		var namespace = mw.config.get('wgNamespaceNumber');
	
		switch (venue) {
			case 'afd':
				if (namespace !== 0) {
					text = 'BQXB chỉ được dùng đối với bài viết.';
				} else if (mw.config.get('wgIsRedirect')) {
					text = 'Vui lòng đi đến bài viết mục tiêu để tạo biểu quyết xóa.';
				}
				break;
			// case 'tfd':
			//     if (namespace === 10 && /-stub$/.test(Morebits.pageNameNorm)) {
			//         text = 'Sử dụng CfD cho các mẫu sơ khai.';
			//     } else if (Morebits.pageNameNorm.indexOf('Template:User ') === 0) {
			//         text = 'Vui lòng sử dụng MfD cho các hộp người dùng';
			//     }
			//     break;
			// case 'cfd':
			//     if ([ 10, 14 ].indexOf(namespace) === -1) {
			//         text = 'CfD chỉ dành cho các thể loại và bản mẫu sơ khai.';
			//     }
			//     break;
			// case 'cfds':
			//     if (namespace !== 14) {
			//         text = 'CfDS chỉ dành cho các thể loại.';
			//     }
			//     break;
			case 'ffd':
				if (namespace !== 6) {
					text = 'Biểu quyết xóa tập tin (FFD) chỉ được dùng đối với tập tin!';
				}
				break;
			// Tất cả đều thực hiện ở YCDCT
			// case 'rm':
			//     if (namespace === 14) { // category
			//         text = 'Vui lòng sử dụng CfD hoặc CfDS để đổi tên thể loại.';
			//     }
			//     break;
	
			default: // mfd or rfd
				break;
		}
	
		$('#wrong-venue-warn').text(text);
	
	};
	
	Twinkle.xfd.callback.change_category = function twinklexfdCallbackChangeCategory(e) {
		var value = e.target.value;
		var form = e.target.form;
		var old_area = Morebits.quickForm.getElements(e.target.form, 'work_area')[0];
		var work_area = null;
	
		var oldreasontextbox = form.getElementsByTagName('textarea')[0];
		var oldreason = oldreasontextbox ? oldreasontextbox.value : '';
	
		var appendReasonBox = function twinklexfdAppendReasonBox() {
			work_area.append({
				type: 'textarea',
				name: 'reason',
				label: 'Lý do: ',
				value: oldreason,
				tooltip: 'Bạn có thể sử dụng mã wiki trong phần lý do. Twinkle sẽ tự động ký tên cho bạn.'
			});
		};
	
		Twinkle.xfd.callback.wrongVenueWarning(value);
	
		form.previewer.closePreview();
	
		switch (value) {
			case 'afd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Biểu quyết xóa bài',
					name: 'work_area'
				});
	
				work_area.append({
					type: 'div',
					label: Twinkle.makeFindSourcesDiv(),
					style: 'margin-bottom: 5px;'
				});
	
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Bao thẻ xóa với <noinclude>',
							value: 'noinclude',
							name: 'noinclude',
							tooltip: 'Tính năng này sẽ bao thẻ xóa trong &lt;noinclude&gt; để thẻ xóa không bị nhúng vào nội dung. Tùy chọn này thường không cần thiết.'
						}
					]
				});
				work_area.append({
					type: 'select',
					name: 'xfdcat',
					label: 'Chọn thể loại đề cử:',
					list: [
						{ type: 'option', label: 'Không rõ', value: '?', selected: true },
						{ type: 'option', label: 'Phương tiện và âm nhạc', value: 'M' },
						{ type: 'option', label: 'Tổ chức, công ty hoặc sản phẩm', value: 'O' },
						{ type: 'option', label: 'Tiểu sử', value: 'B' },
						{ type: 'option', label: 'Các chủ đề xã hội', value: 'S' },
						{ type: 'option', label: 'Web hay internet', value: 'W' },
						{ type: 'option', label: 'Trò chơi hoặc thể thao', value: 'G' },
						{ type: 'option', label: 'Khoa học và công nghệ', value: 'T' },
						{ type: 'option', label: 'Hư cấu và nghệ thuật', value: 'F' },
						{ type: 'option', label: 'Địa điểm và phương tiện đi lại', value: 'P' },
						{ type: 'option', label: 'Chủ đề không thể xác định được hoặc không thể phân loại được', value: 'I' },
						{ type: 'option', label: 'Tranh luận chưa được phân loại', value: 'U' }
					]
				});
	
				/* viwiki không cần chức năng này
				// delsort categories list copied off [[User:Enterprisey/delsort.js]], originally taken from [[WP:DS/C]]
				var delsortCategories = {
					'Người': ['Người', 'Học giả và nhà giáo dục', 'Diễn viên và nhà làm phim', 'Nghệ sĩ', 'Tác giả', 'Ban nhạc và nhạc sĩ', 'Doanh nhân', 'Chính trị gia', 'Người thể thao', 'Phụ nữ', 'Danh sách người'],
					'Nghệ thuật': ['Nghệ thuật', 'Yếu tố hư cấu', 'Khoa học viễn tưởng và giả tưởng'],
					'Nghệ thuật/Ẩm thực': ['Đồ ăn và thức uống', 'Rượu'],
					'Nghệ thuật/Ngôn ngữ': ['Ngôn ngữ', 'Tạp chí học thuật', 'Thư mục', 'Báo chí', 'Văn học', 'Logic', 'Truyền thông tin tức', 'Triết học', 'Thơ ca'],
					'Nghệ thuật/Biểu diễn': ['Album và bài hát', 'Khiêu vũ', 'Phim', 'Phép thuật', 'Âm nhạc', 'Đài phát thanh', 'Truyền hình', 'Nhà hát', 'Trò chơi điện tử'],
					'Nghệ thuật/Nghệ thuật thị giác': ['Nghệ thuật thị giác', 'Kiến trúc', 'Thời trang', 'Nhiếp ảnh'],
					'Nghệ thuật/Truyện tranh và hoạt hình': ['Truyện tranh và hoạt hình', 'Anime và manga', 'Webcomics'],
					'Địa điểm yêu thích': ['Bảo tàng và thư viện', 'Trung tâm mua sắm'],
					'Chủ đề': ['Động vật', 'Quan hệ song phương', 'Kinh doanh', 'Chủ nghĩa bảo thủ', 'Thuyết âm mưu', 'Tội phạm', 'Người khuyết tật', 'Phân biệt đối xử', 'Nhóm sắc tộc', 'Sự kiện', 'Trò chơi','Sức khỏe và thể chất','Lịch sử','Luật pháp','Quân đội','Tổ chức','Điều huyền bí','Vi phạm bản quyền','Chính trị','Khủng bố'],
					'Chủ đề/Kinh doanh': ['Kinh doanh', 'Quảng cáo', 'Công ty', 'Quản lý', 'Tài chính'],
					'Chủ đề/Văn hóa': ['Cuộc thi sắc đẹp', 'Thời trang', 'Thần thoại', 'Văn hóa đại chúng', 'Tình dục và giới tính'],
					'Chuyên đề/Giáo dục': ['Giáo dục', 'Anh em và tổ chức từ thiện', 'Trường học'],
					'Chủ đề/Tôn giáo': ['Tôn giáo', 'Chủ nghĩa vô thần', 'Kinh thánh', 'Phật giáo', 'Cơ đốc giáo', 'Hồi giáo', 'Do Thái giáo', 'Ấn Độ giáo', 'Đạo ngoại giáo', 'Đạo Sikh', 'Tâm linh' ],
					'Chuyên đề/Khoa học': ['Khoa học', 'Khảo cổ học', 'Thiên văn học', 'Khoa học hành vi', 'Kinh tế học', 'Môi trường', 'Địa lý', 'Toán học', 'Y học', 'Sinh vật học', 'Xã hội khoa học', 'Giao thông vận tải'],
					'Chuyên đề/Thể thao': ['Thể thao', 'Bóng bầu dục kiểu Mỹ', 'Bóng chày', 'Bóng rổ', 'Thể hình', 'Quyền anh', 'Cricket', 'Đi xe đạp', 'Bóng đá', 'Golf', 'Ngựa đua xe',' Khúc côn cầu trên băng',' Liên đoàn bóng bầu dục',' Bóng mềm','Võ thuật','Đấu vật'],
					'Chuyên đề/Công nghệ': ['Kỹ thuật', 'Hàng không', 'Tính toán', 'Súng cầm tay', 'Internet', 'Phần mềm', 'Website'],
					'Dạng trang Wikipedia': ['Định hướng', 'Danh sách'],
					'Địa lý/Châu Phi': ['Châu Phi', 'Ai Cập', 'Ethiopia', 'Ghana', 'Kenya', 'Laos', 'Mauritius', 'Morocco', 'Nigeria', 'Somalia', 'Nam Phi', 'Zimbabwe'],
					'Địa lý/Châu Á': ['Châu Á', 'Afghanistan', 'Bangladesh', 'Bahrain', 'Brunei', 'Cambodia', 'Trung Quốc', 'Hong Kong', 'Ấn Độ', 'Indonesia', 'Nhật Bản', 'Korea', 'Malaysia', 'Maldives', 'Mông Cổ', 'Myanmar', 'Nepal', 'Pakistan', 'Philippines', 'Singapore', 'Hàn Quốc', 'Sri Lanka', 'Đài Loan', 'Thái Lan', 'Việt Nam'],
					'Địa lý/Châu Á/Trung Á': ['Trung Á', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'],
					'Địa lý/Châu Á/Trung Đông': ['Trung Đông', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Libya', 'Palestine', 'Saudi Arabia', 'Syria', 'UAE', 'Yemen', 'Qatar'],
					'Địa lý/Châu Âu': ['Châu Âu', 'Albania', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Bỉ', 'Bosnia và Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Cộng hòa Czech', 'Đan Mạch', 'Estonia', 'Phần Lan', 'Pháp', 'Georgia (quốc gia)', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Ý', 'Jersey', 'Kosovo', 'Latvia', 'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Montenegro', 'Hà Lan', 'Na Uy', 'Ba Lan', 'Bồ Đào Nha', 'Romania', 'Nga', 'Serbia', 'Slovakia', 'Slovenia', 'Tây Ban Nha', 'Thụy Điển', 'Thụy Sĩ', 'Thổ Nhĩ Kỳ', 'Ukraine', 'Nam Tư'],
					'Địa lý/Châu Âu/Vương quốc Anh': ['Vương quốc Anh', 'Anh', 'Bắc Ireland', 'Scotland', 'Wales'],
					'Địa lý/Châu Đại Dương': ['Oceania', 'Antarctica', 'Australia', 'New Zealand'],
					'Địa lý/Châu Mỹ/Canada': ['Canada', 'British Columbia', 'Manitoba', 'Nova Scotia', 'Ontario', 'Quebec', 'Alberta'],
					'Địa lý/Châu Mỹ/Châu Mỹ Latinh': ['Mỹ Latinh', 'Caribbean', 'South America', 'Argentina', 'Barbados', 'Belize', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Haiti', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico', 'Trinidad and Tobago', 'Uruguay', 'Venezuela', 'Grenada'],
					'Địa lý /Châu Mỹ /Hoa Kỳ': ['Hoa Kỳ', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia (U.S. state)', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Đảo Rhode', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'],
					'Địa lý/Chưa được sắp xếp': ['Quần đảo']
				};
	
				var delsort = work_area.append({
					type: 'select',
					multiple: true,
					name: 'delsortCats',
					label: 'Chọn thể loại sắp xếp xóa: ',
					tooltip: 'Chọn một vài thể loại có liên quan cụ thể đến chủ đề của bài viết. Hãy chính xác nhất có thể; các danh mục như Người và Hoa Kỳ chỉ nên được sử dụng khi không áp dụng các thể loại khác.'
				});*/
	
				/* viwiki không cần chức năng này
				$.each(delsortCategories, function(groupname, list) {
					var group = delsort.append({ type: 'optgroup', label: groupname });
					list.forEach(function(item) {
						group.append({ type: 'option', label: item, value: item });
					});
				});*/
	
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
	
				/* viwiki không cần chức năng này
				$(work_area).find('[name=delsortCats]')
					.attr('data-placeholder', 'Chọn các trang sắp xếp xóa')
					.select2({
						width: '100%',
						matcher: Morebits.select2.matcher,
						templateResult: Morebits.select2.highlightSearchMatches,
						language: {
							searching: Morebits.select2.queryInterceptor
						},
						// Link text to the page itself
						templateSelection: function(choice) {
							return $('<a>').text(choice.text).attr({
								href: mw.util.getUrl('Wikipedia:WikiProject_Deletion_sorting/' + choice.text),
								target: '_blank'
							});
						}
					});*/
	
				mw.util.addCSS(
					// Remove black border
					'.select2-container--default.select2-container--focus .select2-selection--multiple { border: 1px solid #aaa; }' +
	
					// Reduce padding
					'.select2-results .select2-results__option { padding-top: 1px; padding-bottom: 1px; }' +
					'.select2-results .select2-results__group { padding-top: 1px; padding-bottom: 1px; } ' +
	
					// Adjust font size
					'.select2-container .select2-dropdown .select2-results { font-size: 13px; }' +
					'.select2-container .selection .select2-selection__rendered { font-size: 13px; }' +
	
					// Make the tiny cross larger
					'.select2-selection__choice__remove { font-size: 130%; }'
				);
				break;
	
			case 'tfd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Thảo luận xóa bản mẫu',
					name: 'work_area'
				});
	
				var templateOrModule = mw.config.get('wgPageContentModel') === 'Scribunto' ? 'module' : 'template';
				work_area.append({
					type: 'select',
					label: 'Chọn loại thao tác mong muốn: ',
					name: 'xfdcat',
					event: function(e) {
						var target = e.target,
							tfdtarget = target.form.tfdtarget;
						// add/remove extra input box
						if (target.value === 'tfm' && !tfdtarget) {
							tfdtarget = new Morebits.quickForm.element({
								name: 'tfdtarget',
								type: 'input',
								label: 'Other ' + templateOrModule + ' to be merged: ',
								tooltip: 'Required. Should not include the ' + Morebits.string.toUpperCaseFirstChar(templateOrModule) + ': namespace prefix.',
								required: true
							});
							target.parentNode.appendChild(tfdtarget.render());
						} else {
							$(Morebits.quickForm.getElementContainer(tfdtarget)).remove();
							tfdtarget = null;
						}
					},
					list: [
						{ type: 'option', label: 'Xóa', value: 'tfd', selected: true },
						{ type: 'option', label: 'Trộn', value: 'tfm' }
					]
				});
				work_area.append({
					type: 'select',
					name: 'templatetype',
					label: 'Phong cách hiển thị thẻ xóa: ',
					tooltip: 'Which <code>type=</code> parameter to pass to the TfD tag template.',
					list: templateOrModule === 'module' ? [
						{ type: 'option', value: 'module', label: 'Module', selected: true }
					] : [
						{ type: 'option', value: 'standard', label: 'Tiêu chuẩn', selected: true },
						{ type: 'option', value: 'sidebar', label: 'Sidebar/infobox', selected: $('.infobox').length },
						{ type: 'option', value: 'inline', label: 'Bản mẫu nội dòng' },
						{ type: 'option', value: 'tiny', label: 'Nội dòng nhỏ' }
					]
				});
	
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Bao thẻ xóa bằng <noinclude> (chỉ dành cho việc thế các bản mẫu, cú pháp {{thế|tên bản mẫu}})',
							value: 'noinclude',
							name: 'noinclude',
							tooltip: 'Tính năng này sẽ bao thẻ xóa trong &lt;noinclude&gt; để không bị thay thế cùng với các bản mẫu.',
							disabled: templateOrModule === 'module',
							checked: !!$('.box-Subst_only').length // Default to checked if page carries {{subst only}}
						}
					]
				});
	
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'mfd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Thảo luận xóa khác',
					name: 'work_area'
				});
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Bao thẻ xóa bằng <noinclude>',
							value: 'noinclude',
							name: 'noinclude',
							tooltip: 'Tính năng này sẽ bao thẻ xóa trong &lt;noinclude&gt; để không bị nhúng vào nội dung. Chọn tùy chọn này cho các hộp người dùng.'
						}
					]
				});
				if ((mw.config.get('wgNamespaceNumber') === 2 /* User: */ || mw.config.get('wgNamespaceNumber') === 3 /* User talk: */) && mw.config.exists('wgRelevantUserName')) {
					work_area.append({
						type: 'checkbox',
						list: [
							{
								label: 'Also notify owner of userspace if they are not the page creator',
								value: 'notifyuserspace',
								name: 'notifyuserspace',
								tooltip: 'If the user in whose userspace this page is located is not the page creator (for example, the page is a rescued article stored as a userspace draft), notify the userspace owner as well.',
								checked: true
							}
						]
					});
				}
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
			case 'ffd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Không gian thảo luận dành cho tập tin',
					name: 'work_area'
				});
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'cfd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Các thể loại thảo luận',
					name: 'work_area'
				});
				var isCategory = mw.config.get('wgNamespaceNumber') === 14;
				work_area.append({
					type: 'select',
					label: 'Chọn loại thao tác mong muốn: ',
					name: 'xfdcat',
					event: function(e) {
						var value = e.target.value,
							cfdtarget = e.target.form.cfdtarget,
							cfdtarget2 = e.target.form.cfdtarget2;
	
						// update enabled status
						cfdtarget.disabled = value === 'cfd' || value === 'sfd-t';
	
						if (isCategory) {
							// update label
							if (value === 'cfs') {
								Morebits.quickForm.setElementLabel(cfdtarget, 'Target categories: ');
							} else if (value === 'cfc') {
								Morebits.quickForm.setElementLabel(cfdtarget, 'Target article: ');
							} else {
								Morebits.quickForm.setElementLabel(cfdtarget, 'Target category: ');
							}
							// add/remove extra input box
							if (value === 'cfs') {
								if (cfdtarget2) {
									cfdtarget2.disabled = false;
									$(cfdtarget2).show();
								} else {
									cfdtarget2 = document.createElement('input');
									cfdtarget2.setAttribute('name', 'cfdtarget2');
									cfdtarget2.setAttribute('type', 'text');
									cfdtarget2.setAttribute('required', 'true');
									cfdtarget.parentNode.appendChild(cfdtarget2);
								}
							} else {
								$(cfdtarget2).prop('disabled', true);
								$(cfdtarget2).hide();
							}
						} else { // Update stub template label
							Morebits.quickForm.setElementLabel(cfdtarget, 'Bản mẫu sơ khai đích: ');
						}
					},
					list: isCategory ? [
						{ type: 'option', label: 'Xóa', value: 'cfd', selected: true },
						{ type: 'option', label: 'Trộn', value: 'cfm' },
						{ type: 'option', label: 'Đang đổi tên', value: 'cfr' },
						{ type: 'option', label: 'Tách nội dung', value: 'cfs' },
						{ type: 'option', label: 'Chuyển thành bài viết', value: 'cfc' }
					] : [
						{ type: 'option', label: 'Xóa sơ khai', value: 'sfd-t', selected: true },
						{ type: 'option', label: 'Đổi tên sơ khai', value: 'sfr-t' }
					]
				});
	
				work_area.append({
					type: 'input',
					name: 'cfdtarget',
					label: 'Thể loại mục tiêu: ', // default, changed above
					disabled: true,
					required: true, // only when enabled
					value: ''
				});
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'cfds':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Các thể loại dành cho đổi tên nhanh',
					name: 'work_area'
				});
				work_area.append({
					type: 'select',
					label: 'Tiêu chí phụ của tiêu chí C2: ',
					name: 'xfdcat',
					tooltip: 'Xem WP:CFDS để được giải thích đầy đủ.',
					list: [
						{ type: 'option', label: 'C2A: Sửa lỗi chính tả và đánh máy', value: 'C2A', selected: true },
						{ type: 'option', label: 'C2B: Các quy ước đổi tên và phân định', value: 'C2B' },
						{ type: 'option', label: 'C2C: Đồng nhất với tên các thể loại tương tự', value: 'C2C' },
						{ type: 'option', label: 'C2D: Đổi tên để khớp với tên bài viết', value: 'C2D' },
						{ type: 'option', label: 'C2E: Yêu cầu tác giả', value: 'C2E' },
						{ type: 'option', label: 'C2F: Một bài viết cùng tên', value: 'C2F' }
					]
				});
	
				work_area.append({
					type: 'input',
					name: 'cfdstarget',
					label: 'Tên mới: ',
					value: '',
					required: true
				});
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'rfd':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Thảo luận xóa trang đổi hướng',
					name: 'work_area'
				});
	
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Thông báo cho trang mục tiêu nếu có thể',
							value: 'relatedpage',
							name: 'relatedpage',
							tooltip: "Người tạo trang sẽ được thông báo qua một bản mẫu nếu tính năng này được kích hoạt.",
							checked: true
						}
					]
				});
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			case 'rm':
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Yêu cầu di chuyển',
					name: 'work_area'
				});
				
				work_area.append({
					type: 'input',
					name: 'newname',
					label: 'Tiêu đề mới: ',
					tooltip: 'Tiêu đề mới cần di chuyển, để trống nếu không chắc chắn tiêu đề nào phù hợp.'
				});
	
				appendReasonBox();
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
	
			default:
				work_area = new Morebits.quickForm.element({
					type: 'field',
					label: 'Không có gì cho bất cứ điều gì',
					name: 'work_area'
				});
				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
		}
	
		// Return to checked state when switching, but no creator notification for CFDS or RM
		form.notifycreator.disabled = value === 'cfds' || value === 'rm';
		form.notifycreator.checked = !form.notifycreator.disabled;
	};
	
	Twinkle.xfd.setWatchPref = function twinklexfdsetWatchPref(pageobj, pref) {
		switch (pref) {
			case 'yes':
				pageobj.setWatchlist(true);
				break;
			case 'no':
				pageobj.setWatchlistFromPreferences(false);
				break;
			default:
				pageobj.setWatchlistFromPreferences(true);
				break;
		}
	};
	
	Twinkle.xfd.callbacks = {
		getDiscussionWikitext: function(venue, params) {
			if (venue === 'cfds') { // CfD/S takes a completely different style
				return '* [[:' + Morebits.pageNameNorm + ']] to [[:' + params.cfdstarget + ']]\u00A0\u2013 ' +
					params.xfdcat + (params.reason ? ': ' + Morebits.string.formatReasonText(params.reason) : '.') + ' ~~~~';
				// U+00A0 NO-BREAK SPACE; U+2013 EN RULE
			}
			if (venue === 'rm') {
				// even if invoked from talk page, propose the subject page for move
				var pageName = new mw.Title(Morebits.pageNameNorm).getSubjectPage().toText();
				return '{{subst:RMassist|1=' + pageName + '|2=' + params.newname + '|lý do=' + params.reason + '|sig=~~~~}}';
			}
	
			var text = '{{subst:' + venue + '2';
			var reasonKey = venue === 'ffd' ? 'Reason' : 'text';
			// Add a reason unconditionally, so that at least a signature is added
			if (params.reason) {
				text += '|' + reasonKey + '=' + Morebits.string.formatReasonText(params.reason) + ' ~~~~';
			} else {
				text += '|' + reasonKey + '=~~~~';
			}
	
			if (venue === 'afd' || venue === 'mfd') {
				text += '|pg=' + Morebits.pageNameNorm;
				if (venue === 'afd') {
					text += '|cat=' + params.xfdcat;
				}
			} else if (venue === 'rfd') {
				text += '|redirect=' + Morebits.pageNameNorm;
			} else {
				text += '|1=' + mw.config.get('wgTitle');
				if (mw.config.get('wgPageContentModel') === 'Scribunto') {
					text += '|module=Module:';
				}
			}
	
			if (params.rfdtarget) {
				text += '|target=' + params.rfdtarget + (params.section ? '#' + params.section : '');
			} else if (params.tfdtarget) {
				text += '|2=' + params.tfdtarget;
			} else if (params.cfdtarget) {
				text += '|2=' + params.cfdtarget;
				if (params.cfdtarget2) {
					text += '|3=' + params.cfdtarget2;
				}
			} else if (params.uploader) {
				text += '|Uploader=' + params.uploader;
			}
	
			text += '}}';
	
			/* viwiki không cần chức năng này
			if (params.delsortCats) { // Only for AFDs
				params.delsortCats.forEach(function (cat) {
					text += '\n{{subst:delsort|' + cat + '|~~~~}}';
				});
			}*/
	
			return text;
		},
		showPreview: function(form, venue, params) {
			var templatetext = Twinkle.xfd.callbacks.getDiscussionWikitext(venue, params);
			if (venue === 'rm') { // RM templates are sensitive to page title
				form.previewer.beginRender(templatetext, 'Wikipedia:Yêu cầu di chuyển trang');
			} else {
				form.previewer.beginRender(templatetext, 'WP:TW'); // Force wikitext
			}
		},
		preview: function(form) {
			// venue, reason, xfdcat, tfdtarget, cfdtarget, cfdtarget2, cfdstarget, delsortCats, newname
			var params = Morebits.quickForm.getInputData(form);
	
			var venue = params.venue;
	
			// Remove CfD or TfD namespace prefixes if given
			if (params.tfdtarget) {
				params.tfdtarget = utils.stripNs(params.tfdtarget);
			} else if (params.cfdtarget) {
				params.cfdtarget = utils.stripNs(params.cfdtarget);
				if (params.cfdtarget2) {
					params.cfdtarget2 = utils.stripNs(params.cfdtarget2);
				}
			} else if (params.cfdstarget) { // Add namespace if not given (CFDS)
				params.cfdstarget = utils.addNs(params.cfdstarget, 14);
			}
	
			if (venue === 'ffd') {
				// Fetch the uploader
				var page = new Morebits.wiki.page(mw.config.get('wgPageName'));
				page.lookupCreation(function() {
					params.uploader = page.getCreator();
					Twinkle.xfd.callbacks.showPreview(form, venue, params);
				});
			} else if (venue === 'rfd') { // Find the target
				Twinkle.xfd.callbacks.rfd.findTarget(params, function(params) {
					Twinkle.xfd.callbacks.showPreview(form, venue, params);
				});
			} else if (venue === 'cfd') { // Swap in CfD subactions
				Twinkle.xfd.callbacks.showPreview(form, params.xfdcat, params);
			} else {
				Twinkle.xfd.callbacks.showPreview(form, venue, params);
			}
		},
		addToLog: function(params, initialContrib) {
			if (!Twinkle.getPref('logXfdNominations') || Twinkle.getPref('noLogOnXfdNomination').indexOf(params.venue) !== -1) {
				return;
			}
	
			var usl = new Morebits.userspaceLogger(Twinkle.getPref('xfdLogPageName'));// , 'Adding entry to userspace log');
	
			usl.initialText =
				"This is a log of all [[WP:XFD|deletion discussion]] nominations made by this user using [[WP:TW|Twinkle]]'s XfD module.\n\n" +
				'If you no longer wish to keep this log, you can turn it off using the [[Wikipedia:Twinkle/Preferences|preferences panel]], and ' +
				'nominate this page for speedy deletion under [[WP:CSD#U1|CSD U1]].' +
				(Morebits.userIsSysop ? '\n\nThis log does not track XfD-related deletions made using Twinkle.' : '');
	
			var editsummary = 'Đang ghi nhật trình ' + utils.toTLACase(params.venue) + ' nomination of [[:' + Morebits.pageNameNorm + ']].';
			// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
			var fileLogLink = mw.config.get('wgNamespaceNumber') === 6 ? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} log])' : '';
			// CFD/S and RM don't have canonical links
			var nominatedLink = params.discussionpage ? '[[' + params.discussionpage + '|đã đề cử]]' : 'đã đề cử';
	
			var appendText = '# [[:' + Morebits.pageNameNorm + ']]' + fileLogLink + ' ' + nominatedLink + ' at [[WP:' + params.venue.toUpperCase() + '|' + utils.toTLACase(params.venue) + ']]';
			var extraInfo = '';
	
			switch (params.venue) {
				case 'tfd':
					if (params.xfdcat === 'tfm') {
						appendText += ' (merge)';
						if (params.tfdtarget) {
							var contentModel = mw.config.get('wgPageContentModel') === 'Scribunto' ? 'Module:' : 'Template:';
							extraInfo += '; Other ' + contentModel.toLowerCase() + ' [[';
							if (!/^:?(?:template|module):/i.test(params.tfdtarget)) {
								extraInfo += contentModel;
							}
							extraInfo += params.tfdtarget + ']]';
						}
					}
					break;
				case 'mfd':
					if (initialContrib && params.notifyuserspace && params.userspaceOwner !== initialContrib) {
						extraInfo += ' and {{user|1=' + params.userspaceOwner + '}}';
					}
					break;
				case 'cfd':
					appendText += ' (' + utils.toTLACase(params.xfdcat) + ')';
					if (params.cfdtarget) {
						var categoryOrTemplate = params.xfdcat.charAt(0) === 's' ? 'Template:' : ':Category:';
						extraInfo += '; ' + params.action + ' to: [[' + categoryOrTemplate + params.cfdtarget + ']]';
						if (params.xfdcat === 'cfs' && params.cfdtarget2) {
							extraInfo += ', [[' + categoryOrTemplate + params.cfdtarget2 + ']]';
						}
					}
					break;
				case 'cfds':
					appendText += ' (' + utils.toTLACase(params.xfdcat) + ')';
					// Ensure there's more than just 'Category:'
					if (params.cfdstarget && params.cfdstarget.length > 9) {
						extraInfo += '; New name: [[:' + params.cfdstarget + ']]';
					}
					break;
				case 'rfd':
					if (params.rfdtarget) {
						extraInfo += '; Target: [[:' + params.rfdtarget + ']]';
						if (params.relatedpage) {
							extraInfo += ' (notified)';
						}
					}
					break;
				case 'rm':
					if (params.newname) {
						extraInfo += '; Tên mới: [[:' + params.newname + ']]';
					}
					break;
	
				default: // afd or ffd
					break;
			}
	
			if (initialContrib) {
				appendText += '; notified {{user|1=' + initialContrib + '}}';
			}
			if (extraInfo) {
				appendText += extraInfo;
			}
			appendText += ' ~~~~~';
			if (params.reason) {
				appendText += "\n#* '''Reason''': " + Morebits.string.formatReasonForLog(params.reason);
			}
	
			usl.changeTags = Twinkle.changeTags;
			usl.log(appendText, editsummary);
		},
	
		afd: {
			main: function(apiobj) {
				var xmlDoc = apiobj.responseXML;
				var titles = $(xmlDoc).find('allpages p');
	
				// Only use on viwiki
				var order_regexs = [
					'\\s*[\\/ ](\\d{1,2})\\s*$',
					'\\s*[\\/\\\\][Ll]ần (\\d{1,2})\\s*$',
					'\\s*\\([Ll]ần (\\d{1,2})\\)\\s*$',
					'\\s*\\([Ll]ần thứ (\\d{1,2})\\)\\s*$',
					'\\s*\\(\\s*(\\d+)(?:(?:th|nd|rd|st) nom(?:ination)?)?\\s*\\)\\s*$'
				];
	
				// There has been no earlier entries with this prefix, just go on.
				if (titles.length <= 0) {
					apiobj.params.numbering = apiobj.params.number = '';
				} else {
					var number = 0;
					for (var i = 0; i < titles.length; ++i) {
						var title = titles[i].getAttribute('title');
	
						// First, simple test, is there an instance with this exact name?
						if (title === 'Wikipedia:Biểu quyết xoá bài/' + Morebits.pageNameNorm) {
							number = Math.max(number, 1);
							continue;
						}
	
						// Replace with the one below
						// var order_re = new RegExp('^' +
						//     Morebits.string.escapeRegExp('Wikipedia:Biểu quyết xoá bài/' + Morebits.pageNameNorm) +
						//     '\\s*\\(\\s*(\\d+)(?:(?:th|nd|rd|st) nom(?:ination)?)?\\s*\\)\\s*$');
						// var match = order_re.exec(title);
	
						// Only use on viwiki
						var match = null;
						order_regexs_loop: for (var j = 0; j < order_regexs.length; j++) {
							var order_re = new RegExp('^' +
								Morebits.string.escapeRegExp('Wikipedia:Biểu quyết xoá bài/' + Morebits.pageNameNorm) +
								order_regexs[j]);
							match = order_re.exec(title);
							if (match) {
								break order_regexs_loop;
							}
						}
	
						// No match; A non-good value
						if (!match) {
							continue;
						}
	
						// A match, set number to the max of current
						number = Math.max(number, Number(match[1]));
					}
					apiobj.params.number = utils.num2order(parseInt(number, 10) + 1);
					apiobj.params.numbering = number > 0 ? ' (lần ' + apiobj.params.number + ')' : '';
				}
				apiobj.params.discussionpage = 'Wikipedia:Biểu quyết xoá bài/' + Morebits.pageNameNorm + apiobj.params.numbering;
	
				Morebits.status.info('Trang thảo luận tiếp theo', '[[' + apiobj.params.discussionpage + ']]');
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = apiobj.params.discussionpage;
				Morebits.wiki.actionCompleted.notice = 'Đề cử đã hoàn tất, hiện đang chuyển hướng đến trang thảo luận';
	
				// Tagging article
				var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Đang thêm thẻ xóa vào bài viết');
				wikipedia_page.setFollowRedirect(true);  // should never be needed, but if the article is moved, we would want to follow the redirect
				wikipedia_page.setChangeTags(Twinkle.changeTags); // Here to apply to triage
				wikipedia_page.setCallbackParameters(apiobj.params);
				wikipedia_page.load(Twinkle.xfd.callbacks.afd.taggingArticle);
			},
			// Tagging needs to happen before everything else: this means we can check if there is an AfD tag already on the page
			taggingArticle: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				if (!pageobj.exists()) {
					statelem.error("Có vẻ như trang này không tồn tại; có lẽ nó đã bị xóa");
					return;
				}
	
				// Check for existing AfD tag, for the benefit of new page patrollers
				var textNoAfd = text.replace(/<!--.*AfD.*\n\{\{(?:Article for deletion\/dated|Afd\/dated|AfDM).*\}\}\n<!--.*(?:\n<!--.*)?AfD.*(?:\s*\n)?/g, '');
				if (text !== textNoAfd) {
					if (confirm('Một thẻ AfD đã được tìm thấy trên bài viết này. Có thể ai đó đã đặt thẻ này trước. Nhấp vào OK để thay thế thẻ AfD hiện tại (không được khuyến cáo) hoặc Hủy để từ bỏ đề cử của bạn.')) {
						text = textNoAfd;
					} else {
						statelem.error('Bài viết đã được gắn thẻ AfD và bạn đã chọn hủy bỏ');
						window.location.reload();
						return;
					}
				}
	
				// Now we know we want to go ahead with it, trigger the other AJAX requests
	
				// Start discussion page, will also handle pagetriage and delsort listings
				var wikipedia_page = new Morebits.wiki.page(params.discussionpage, 'Đang tạo trang thảo luận xóa bài viết');
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.afd.discussionPage);
	
				// Today's list
				var date = new Morebits.date(pageobj.getLoadTime());
				/*wikipedia_page = new Morebits.wiki.page('Wikipedia:Biểu quyết xoá bài/' +
					date.format('YYYY/MM', 'utc'), "Đang thêm thảo luận vào danh sách hôm nay");*/
				
				wikipedia_page = new Morebits.wiki.page('Wikipedia:Biểu quyết xoá bài', "Đang thêm thảo luận vào danh sách hôm nay");
					
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.afd.todaysList);
				
				// Notification to first contributor
				if (params.notifycreator) {
					var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
					thispage.setCallbackParameters(params);
					thispage.setLookupNonRedirectCreator(true); // Look for author of first non-redirect revision
					thispage.lookupCreation(Twinkle.xfd.callbacks.afd.userNotification);
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(params, null);
				}
	
				// Remove some tags that should always be removed on AfD.
				text = text.replace(/\{\{\s*(dated prod|dated prod blp|Prod blp\/dated|Proposed deletion\/dated|prod2|Proposed deletion endorsed|Userspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, '');
				// Then, test if there are speedy deletion-related templates on the article.
				var textNoSd = text.replace(/\{\{\s*(db(-\w*)?|delete|(?:hang|hold)[- ]?on)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, '');
				if (text !== textNoSd && confirm('Một thẻ xóa nhanh đã được tìm thấy trên trang này. Có nên xóa thẻ này không?')) {
					text = textNoSd;
				}
	
				var tag = (params.noinclude ? '<noinclude>{{' : '{{') + (params.number === '' ? 'subst:afd|help=off' : 'subst:afdx|' +
						params.number + '|help=off') + (params.noinclude ? '}}</noinclude>\n' : '}}\n');
	
				// Insert tag after short description or any hatnotes
				var wikipage = new Morebits.wikitext.page(text);
				text = wikipage.insertAfterTemplates(tag, Twinkle.hatnoteRegex).getText();
	
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đã được đề cử xóa; xem [[:' + params.discussionpage + ']].');
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('nocreate');
				pageobj.save();
			},
			discussionPage: function(pageobj) {
				var params = pageobj.getCallbackParameters();
	
				pageobj.setPageText(Twinkle.xfd.callbacks.getDiscussionWikitext('afd', params));
				pageobj.setEditSummary('Đang tạo trang thảo luận xóa cho [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('createonly');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
					
					/* không cần chức năng này ở viwiki
					// Actions that should wait on the discussion page actually being created
					// and whose errors shouldn't output the user rationale
					// List at deletion sorting pages
					if (params.delsortCats) {
						params.delsortCats.forEach(function (cat) {
							var delsortPage = new Morebits.wiki.page('Wikipedia:Biểu quyết xóa bài/' + cat, 'Đang thêm vào danh sách các cuộc thảo luận xóa liên quan đến ' + cat);
							delsortPage.setFollowRedirect(true); // In case a category gets renamed
							delsortPage.setCallbackParameters({discussionPage: params.discussionpage});
							delsortPage.load(Twinkle.xfd.callbacks.afd.delsortListing);
						});
					}
					// Mark the page as curated/patrolled, if wanted
					if (Twinkle.getPref('markXfdPagesAsPatrolled')) {
						pageobj.triage();
					}*/
					
				});
			},
			// biểu quyết xóa bài (AfD) tính theo tháng
			todaysList: function(pageobj) {
				var text = pageobj.getPageText() + '\n';
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
				
				var date = new Morebits.date(pageobj.getLoadTime());
				var month = date.getUTCMonth() + 1;
				var year = date.getUTCFullYear();
				var date_header = '==Tháng ' + month + ' năm ' + year + '==\n';
				//var date_header_regex = new RegExp(date.format('==[\\s]*T[h]áng[\\s]+MM[\\s]+nă[m][\\s]+YYYY[\\s]*==', 'utc'));
				
				var date_header_regex = new RegExp('==\\s*Tháng\\s+' + month + '\\s+năm\\s+' + year + '\\s*==\n');
				
				var new_data = '{{subst:afd4|pg=' + Morebits.pageNameNorm + params.numbering + '}}\n';
				
				if (date_header_regex.test(text)) { // nếu đã có đề mục tương ứng
					statelem.info('Đã tìm thấy phần của tháng này, đang tiến hành thêm mục mới');
					text = text.replace(date_header_regex, date_header + new_data);
				} else { // nếu cần tạo phần mới
					statelem.info('Không tìm thấy phần nào cho tháng này, hãy tiếp tục tạo một phần mới');
					text = text.replace('<!--Vui lòng tạo một đề mục dưới dòng này mới khi đã bước sang tháng khác-->', '<!--Vui lòng tạo một đề mục dưới dòng này mới khi đã bước sang tháng khác-->\n' + date_header + new_data);
				}
	
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang thêm [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchList'));
				pageobj.setCreateOption('recreate');
				pageobj.save();
			},
	
			userNotification: function(pageobj) {
				var params = pageobj.getCallbackParameters();
				var initialContrib = pageobj.getCreator();
	
				// Disallow warning yourself
				if (initialContrib === mw.config.get('wgUserName')) {
					pageobj.getStatusElement().warn('Bạn (' + initialContrib + ') đã tạo trang này; đang bỏ qua thông báo người dùng');
					return;
				}
	
				var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Đang thông báo cho người đóng góp đầu tiên (' + initialContrib + ')');
				var notifytext = '\n{{subst:Afd notice|1=' + Morebits.pageNameNorm + (params.numbering !== '' ? '|order=&#32;' + params.numbering : '') + '}} ~~~~';
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Thông báo: [[' + params.discussionpage + '|đề cử]] [[:' + Morebits.pageNameNorm + ']] ở [[Wikipedia:Biểu quyết xoá bài]].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
				usertalkpage.setFollowRedirect(true, false);
				usertalkpage.append(function onNotifySuccess() {
					// add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, initialContrib);
				}, function onNotifyError() {
					// if user could not be notified, log nomination without mentioning that notification was sent
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
			}
			
			/*,
			delsortListing: function(pageobj) {
				var discussionPage = pageobj.getCallbackParameters().discussionPage;
				var text = pageobj.getPageText().replace('directly below this line -->', 'directly below this line -->\n{{' + discussionPage + '}}');
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang liệt kê [[:' + discussionPage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				pageobj.setCreateOption('nocreate');
				pageobj.save();
			}*/
		},
	
	
		tfd: {
			taggingTemplate: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var tableNewline = params.templatetype === 'standard' || params.templatetype === 'sidebar' ? '\n' : ''; // No newline for inline
	
				pageobj.setPageText((params.noinclude ? '<noinclude>' : '') + '{{subst:template for discussion|help=off' +
					(params.templatetype !== 'standard' ? '|type=' + params.templatetype : '') + (params.noinclude ? '}}</noinclude>' : '}}') + tableNewline + text);
				pageobj.setEditSummary('Được đề cử xóa; xem [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				if (params.scribunto) {
					pageobj.setCreateOption('recreate'); // Module /doc might not exist
				}
				pageobj.save();
			},
			taggingTemplateForMerge: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var tableNewline = params.templatetype === 'standard' || params.templatetype === 'sidebar' ? '\n' : ''; // No newline for inline
	
				pageobj.setPageText((params.noinclude ? '<noinclude>' : '') + '{{subst:tfm|help=off|' +
					(params.templatetype !== 'standard' ? 'type=' + params.templatetype + '|' : '') + '1=' + params.otherTemplateName.replace(/^(?:Template|Module):/, '') +
					(params.noinclude ? '}}</noinclude>' : '}}') + tableNewline + text);
				pageobj.setEditSummary('Listed for merging with [[:' + params.otherTemplateName + ']]; see [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				if (params.scribunto) {
					pageobj.setCreateOption('recreate'); // Module /doc might not exist
				}
				pageobj.save();
			},
			todaysList: function(pageobj) {
				var old_text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				var added_data = Twinkle.xfd.callbacks.getDiscussionWikitext(params.xfdcat, params);
	
				var text = old_text.replace('-->', '-->\n' + added_data);
				if (text === old_text) {
					statelem.error('failed to find target spot for the discussion');
					return;
				}
				pageobj.setPageText(text);
				pageobj.setEditSummary('Adding ' + (params.xfdcat === 'tfd' ? 'deletion nomination' : 'merge listing') + ' of [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
			},
			userNotification: function(pageobj) {
				var initialContrib = pageobj.getCreator();
				var params = pageobj.getCallbackParameters();
	
				// Disallow warning yourself
				if (initialContrib === mw.config.get('wgUserName')) {
					pageobj.getStatusElement().warn('You (' + initialContrib + ') created this page; skipping user notification');
					return;
				}
	
				var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Notifying initial contributor (' + initialContrib + ')');
				var notifytext = '\n';
				var modNotice = mw.config.get('wgPageContentModel') === 'Scribunto' ? '|module=yes' : '';
				switch (params.xfdcat) {
					case 'tfd':
						notifytext += '{{subst:Tfd notice|1=' + mw.config.get('wgTitle') + modNotice + '}} ~~~~';
						break;
					case 'tfm':
						notifytext += '{{subst:Tfm notice|1=' + mw.config.get('wgTitle') + '|2=' + params.tfdtarget + modNotice + '}} ~~~~';
						break;
					default:
						alert('twinklexfd in userNotification: unknown TFD action');
						break;
				}
	
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Notification: [[' + params.discussionpage + '|listing]] of [[:' + pageobj.getPageName() + ']] at [[WP:TFD|templates for discussion]].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
				usertalkpage.setFollowRedirect(true, false);
	
				// Add this nomination to user's userspace log if it isn't the second template
				// in a TfM nomination
				if (params.xfdcat === 'tfd' || pageobj.getPageName() === Morebits.pageNameNorm) {
					usertalkpage.append(function onNotifySuccess() {
						Twinkle.xfd.callbacks.addToLog(params, initialContrib);
					}, function onNotifyError() {
						// if user could not be notified, log without mentioning notification
						Twinkle.xfd.callbacks.addToLog(params, null);
					});
				} else {
					usertalkpage.append();
				}
			}
		},
	
	
		mfd: {
			main: function(apiobj) {
				var xmlDoc = apiobj.responseXML;
				var titles = $(xmlDoc).find('allpages p');
	
				// There has been no earlier entries with this prefix, just go on.
				if (titles.length <= 0) {
					apiobj.params.numbering = apiobj.params.number = '';
				} else {
					var number = 0;
					for (var i = 0; i < titles.length; ++i) {
						var title = titles[i].getAttribute('title');
	
						// First, simple test, is there an instance with this exact name?
						if (title === 'Wikipedia:Miscellany for deletion/' + Morebits.pageNameNorm) {
							number = Math.max(number, 1);
							continue;
						}
	
						var order_re = new RegExp('^' +
								Morebits.string.escapeRegExp('Wikipedia:Miscellany for deletion/' + Morebits.pageNameNorm) +
								'\\s*\\(\\s*(\\d+)(?:(?:th|nd|rd|st) nom(?:ination)?)?\\s*\\)\\s*$');
						var match = order_re.exec(title);
	
						// No match; A non-good value
						if (!match) {
							continue;
						}
	
						// A match, set number to the max of current
						number = Math.max(number, Number(match[1]));
					}
					apiobj.params.number = utils.num2order(parseInt(number, 10) + 1);
					apiobj.params.numbering = number > 0 ? ' (' + apiobj.params.number + ' nomination)' : '';
				}
				apiobj.params.discussionpage = 'Wikipedia:Miscellany for deletion/' + Morebits.pageNameNorm + apiobj.params.numbering;
	
				apiobj.statelem.info('next in order is [[' + apiobj.params.discussionpage + ']]');
	
				// Tagging page
				var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Tagging page with deletion tag');
				wikipedia_page.setFollowRedirect(true);  // should never be needed, but if the page is moved, we would want to follow the redirect
				wikipedia_page.setCallbackParameters(apiobj.params);
				wikipedia_page.load(Twinkle.xfd.callbacks.mfd.taggingPage);
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = apiobj.params.discussionpage;
				Morebits.wiki.actionCompleted.notice = 'Đề cử đã hoàn tất, hiện đang chuyển hướng đến trang thảo luận';
	
				// Discussion page
				wikipedia_page = new Morebits.wiki.page(apiobj.params.discussionpage, 'Đang tạo trang thảo luận xóa');
				wikipedia_page.setCallbackParameters(apiobj.params);
				wikipedia_page.load(Twinkle.xfd.callbacks.mfd.discussionPage);
	
				// Today's list
				wikipedia_page = new Morebits.wiki.page('Wikipedia:Miscellany for deletion', "Adding discussion to today's list");
				wikipedia_page.setPageSection(2);
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(apiobj.params);
				wikipedia_page.load(Twinkle.xfd.callbacks.mfd.todaysList);
	
				// Notification to first contributor, and notification to owner of userspace (if applicable and required)
				if (apiobj.params.notifycreator) {
					var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
					thispage.setCallbackParameters(apiobj.params);
					thispage.lookupCreation(Twinkle.xfd.callbacks.mfd.userNotification);
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(apiobj.params, null);
				}
			},
			taggingPage: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
	
				pageobj.setPageText((params.noinclude ? '<noinclude>' : '') + '{{' +
					(params.number === '' ? 'mfd' : 'mfdx|' + params.number) + '|help=off}}\n' +
					(params.noinclude ? '</noinclude>' : '') + text);
				pageobj.setEditSummary('Được đề cử xóa; xem [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('nocreate');
				pageobj.save();
			},
			discussionPage: function(pageobj) {
				var params = pageobj.getCallbackParameters();
	
				pageobj.setPageText(Twinkle.xfd.callbacks.getDiscussionWikitext('mfd', params));
				pageobj.setEditSummary('Đang tạo trang thảo luận xóa cho [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('createonly');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
			},
			todaysList: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				var date = new Morebits.date(pageobj.getLoadTime());
				var date_header = date.format('==Tháng MM năm YYYY==\n', 'utc');
				var date_header_regex = new RegExp(date.format('(==[\\s]*Tháng[\\s]+MMnăm[\\s]+YYYY[\\s]*==)', 'utc'));
				var new_data = '{{subst:mfd3|pg=' + Morebits.pageNameNorm + params.numbering + '}}';
	
				if (date_header_regex.test(text)) { // we have a section already
					statelem.info('Đã tìm thấy phần của ngày hôm nay, đang tiến hành thêm mục mới');
					text = text.replace(date_header_regex, '$1\n' + new_data);
				} else { // we need to create a new section
					statelem.info('Không tìm thấy phần nào cho ngày hôm nay, hãy tiếp tục tạo một phần mới');
					text = text.replace('==', date_header + new_data + '\n\n==');
				}
	
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang thêm [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchList'));
				pageobj.setCreateOption('recreate');
				pageobj.save();
			},
			userNotification: function(pageobj) {
				var initialContrib = pageobj.getCreator();
				var params = pageobj.getCallbackParameters();
	
				// Also notify the user who owns the subpage if they are not the creator
				params.userspaceOwner = mw.config.get('wgRelevantUserName');
				if (params.notifyuserspace && params.userspaceOwner !== initialContrib) {
					Twinkle.xfd.callbacks.mfd.userNotificationMain(params, params.userspaceOwner, 'Đang thông báo cho chủ sở hữu không gian người dùng');
				}
	
				// Disallow warning yourself
				if (initialContrib === mw.config.get('wgUserName')) {
					pageobj.getStatusElement().warn('Bạn (' + initialContrib + ') đã tạo trang này; bỏ qua thông báo người dùng');
				} else {
					// Used to ensure we only add to the userspace
					// log once, after notifying the initial creator
					params.initialContrib = initialContrib;
					// Really notify the creator
					Twinkle.xfd.callbacks.mfd.userNotificationMain(params, initialContrib, 'Đang thông báo cho người đóng góp ban đầu');
				}
			},
			userNotificationMain: function(params, userTarget, actionName) {
				var usertalkpage = new Morebits.wiki.page('User talk:' + userTarget, actionName + ' (' + userTarget + ')');
				var notifytext = '\n{{subst:Mfd notice|1=' + Morebits.pageNameNorm + (params.numbering !== '' ? '|order=&#32;' + params.numbering : '') + '}} ~~~~';
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Thông báo: [[' + params.discussionpage + '|nomination]] of [[:' + Morebits.pageNameNorm + ']] at [[WP:MFD|miscellany for deletion]].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
				usertalkpage.setFollowRedirect(true, false);
				// Only log once, using the initial creator's notification as our barometer
				if (params.initialContrib === userTarget) {
					usertalkpage.append(function onNotifySuccess() {
						Twinkle.xfd.callbacks.addToLog(params, userTarget);
					}, function onNotifyError() {
						// if user could not be notified, log without mentioning notification
						Twinkle.xfd.callbacks.addToLog(params, null);
					});
				} else {
					usertalkpage.append();
				}
	
			}
		},
	
	
		ffd: {
			main: function(pageobj) {
				// this is coming in from lookupCreation...!
				var params = pageobj.getCallbackParameters();
				var initialContrib = pageobj.getCreator();
				params.uploader = initialContrib;
	
				// Adding discussion
				var wikipedia_page = new Morebits.wiki.page(params.logpage, "Đang thêm thảo luận vào danh sách hôm nay");
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.ffd.todaysList);
	
				// Notification to first contributor
				if (params.notifycreator) {
					// Disallow warning yourself
					if (initialContrib === mw.config.get('wgUserName')) {
						pageobj.getStatusElement().warn('Bạn (' + initialContrib + ') đã tạo tập tin này; bỏ qua thông báo người dùng');
					} else {
						var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Đang thông báo cho người đóng góp ban đầu (' + initialContrib + ')');
						var notifytext = '\n{{subst:Ffd notice|1=' + mw.config.get('wgTitle') + '}}';
						usertalkpage.setAppendText(notifytext);
						usertalkpage.setEditSummary('Thông báo: [[' + params.discussionpage + '|đang liệt kê]] [[:' + Morebits.pageNameNorm + ']] ở [[WP:FFD|các thảo luận tập tin]].');
						usertalkpage.setChangeTags(Twinkle.changeTags);
						usertalkpage.setCreateOption('recreate');
						Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
						usertalkpage.setFollowRedirect(true, false);
						usertalkpage.append(function onNotifySuccess() {
							// add this nomination to the user's userspace log
							Twinkle.xfd.callbacks.addToLog(params, initialContrib);
						}, function onNotifyError() {
							// if user could not be notified, log nomination without mentioning that notification was sent
							Twinkle.xfd.callbacks.addToLog(params, null);
						});
					}
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(params, null);
				}
			},
			taggingImage: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
	
				text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');
	
				pageobj.setPageText('{{ffd|log=' + params.date + '|help=off}}\n' + text);
				pageobj.setEditSummary('Đã mở thảo luận tại [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('recreate');  // it might be possible for a file to exist without a description page
				pageobj.save();
			},
			todaysList: function(pageobj) {
				
				var text = pageobj.getPageText() + '\n';
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				// add date header if the log is found to be empty (a bot should do this automatically, but it sometimes breaks down)
				// tạm thời viwiki chưa cần log
				// if (!pageobj.exists()) { text = '{{subst:Ffd log}}'; }
							
				var de_muc_regex = new RegExp('==\\s*Các\\s+biểu\\s+quyết\\s+hiện\\s+tại\\s*==\n');		
				var de_muc_value = '==Các biểu quyết hiện tại==\n';
				var new_data = Twinkle.xfd.callbacks.getDiscussionWikitext('ffd', params) + '\n';
				
				if (de_muc_regex.test(text)) { // nếu đã có đề mục tương ứng
					statelem.info('Đã tìm thấy phần của tháng này, đang tiến hành thêm mục mới');
					text = text.replace(de_muc_regex, de_muc_value + new_data);
				} 
				else { // nếu cần tạo phần mới
					statelem.info('Không tìm thấy phần nào cho tháng này, hãy tiếp tục tạo một phần mới');
					text = text.replace('{{/Đầu}}', '{{/Đầu}}\n' + de_muc_value + new_data);
				}
				
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang thêm [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchList'));
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
				
			}
	
		},
	
	
		cfd: {
			taggingCategory: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
	
				var added_data = '{{subst:' + params.xfdcat;
				var editsummary = (mw.config.get('wgNamespaceNumber') === 14 ? 'Category' : 'Stub template') +
					' being considered for ' + params.action;
				switch (params.xfdcat) {
					case 'cfd':
					case 'sfd-t':
						break;
					case 'cfc':
						editsummary += ' to an article';
						// falls through
					case 'cfm':
					case 'cfr':
					case 'sfr-t':
						added_data += '|' + params.cfdtarget;
						break;
					case 'cfs':
						added_data += '|' + params.cfdtarget + '|' + params.cfdtarget2;
						break;
					default:
						alert('twinklexfd in taggingCategory(): unknown CFD action');
						break;
				}
				added_data += '}}';
				editsummary += '; see [[:' + params.discussionpage + ']].';
	
				pageobj.setPageText(added_data + '\n' + text);
				pageobj.setEditSummary(editsummary);
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('recreate');  // since categories can be populated without an actual page at that title
				pageobj.save();
			},
			todaysList: function(pageobj) {
				var old_text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				var added_data = Twinkle.xfd.callbacks.getDiscussionWikitext(params.xfdcat, params);
				var editsummary = 'Đang thêm ' + params.action + ' đề cử [[:' + Morebits.pageNameNorm + ']].';
	
				var text = old_text.replace('below this line -->', 'below this line -->\n' + added_data);
				if (text === old_text) {
					statelem.error('không tìm được điểm đích cho cuộc thảo luận');
					return;
				}
	
				pageobj.setPageText(text);
				pageobj.setEditSummary(editsummary);
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
			},
			userNotification: function(pageobj) {
				var initialContrib = pageobj.getCreator();
				var params = pageobj.getCallbackParameters();
	
				// Disallow warning yourself
				if (initialContrib === mw.config.get('wgUserName')) {
					pageobj.getStatusElement().warn('You (' + initialContrib + ') created this page; skipping user notification');
					return;
				}
	
				var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Notifying initial contributor (' + initialContrib + ')');
				var notifytext = '\n{{subst:Cfd notice|1=' + Morebits.pageNameNorm + '|action=' + params.action + (mw.config.get('wgNamespaceNumber') === 10 ? '|stub=yes' : '') + '}} ~~~~';
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Notification: [[' + params.discussionpage + '|listing]] of [[:' + Morebits.pageNameNorm + ']] at [[WP:CFD|categories for discussion]].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
				usertalkpage.setFollowRedirect(true, false);
				usertalkpage.append(function onNotifySuccess() {
					// add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, initialContrib);
				}, function onNotifyError() {
					// if user could not be notified, log nomination without mentioning that notification was sent
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
			}
		},
	
	
		cfds: {
			taggingCategory: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
	
				pageobj.setPageText('{{subst:cfr-speedy|1=' + params.cfdstarget.replace(/^:?Category:/, '') + '}}\n' + text);
				pageobj.setEditSummary('Listed for speedy renaming; see [[WP:CFDS|Categories for discussion/Speedy]].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('recreate');  // since categories can be populated without an actual page at that title
				pageobj.save(function() {
					// No user notification for CfDS, so just add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
			},
			addToList: function(pageobj) {
				var old_text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				var text = old_text.replace('BELOW THIS LINE -->', 'BELOW THIS LINE -->\n' + Twinkle.xfd.callbacks.getDiscussionWikitext('cfds', params));
				if (text === old_text) {
					statelem.error('failed to find target spot for the discussion');
					return;
				}
	
				pageobj.setPageText(text);
				pageobj.setEditSummary('Adding [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
			}
		},
	
	
		rfd: {
			// This gets called both on submit and preview to determine the redirect target
			findTarget: function(params, callback) {
				// Used by regular redirects to find the target, but for all redirects,
				// avoid relying on the client clock to build the log page
				var query = {
					'action': 'query',
					'curtimestamp': true
				};
				if (document.getElementById('softredirect')) {
					// For soft redirects, define the target early
					// to skip target checks in findTargetCallback
					params.rfdtarget = document.getElementById('softredirect').textContent.replace(/^:+/, '');
				} else {
					// Find current target of redirect
					query.titles = mw.config.get('wgPageName');
					query.redirects = true;
				}
				var wikipedia_api = new Morebits.wiki.api('Finding target of redirect', query, Twinkle.xfd.callbacks.rfd.findTargetCallback(callback));
				wikipedia_api.params = params;
				wikipedia_api.post();
			},
			// This is a closure for the callback from the above API request, which gets the target of the redirect
			findTargetCallback: function(callback) {
				return function(apiobj) {
					var $xmlDoc = $(apiobj.responseXML);
					var curtimestamp = $xmlDoc.find('api').attr('curtimestamp');
					apiobj.params.curtimestamp = curtimestamp;
					if (!apiobj.params.rfdtarget) { // Not a softredirect
						var target = $xmlDoc.find('redirects r').first().attr('to');
						if (!target) {
							var message = 'This page does not appear to be a redirect, aborting';
							if (mw.config.get('wgAction') === 'history') {
								message += '. If this is a soft redirect, try again from the content page, not the page history.';
							}
							apiobj.statelem.error(message);
							return;
						}
						apiobj.params.rfdtarget = target;
						var section = $xmlDoc.find('redirects r').first().attr('tofragment');
						apiobj.params.section = section;
					}
					callback(apiobj.params);
				};
			},
			main: function(params) {
				var date = new Morebits.date(params.curtimestamp);
				params.logpage = 'Wikipedia:Redirects for discussion/Log/' + date.format('YYYY MMMM D', 'utc');
				params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;
	
				// Tagging redirect
				var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Thêm thẻ xóa để chuyển hướng');
				wikipedia_page.setFollowRedirect(false);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.rfd.taggingRedirect);
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = params.logpage;
				Morebits.wiki.actionCompleted.notice = "Đề cử đã hoàn tất, hiện đang chuyển hướng đến nhật trình của hôm nay";
	
				// Adding discussion
				wikipedia_page = new Morebits.wiki.page(params.logpage, "Thêm thảo luận vào nhật trình hôm nay");
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.rfd.todaysList);
	
				// Notifications
				if (params.notifycreator || params.relatedpage) {
					var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
					thispage.setCallbackParameters(params);
					thispage.lookupCreation(Twinkle.xfd.callbacks.rfd.sendNotifications);
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(params, null);
				}
			},
			taggingRedirect: function(pageobj) {
				var text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				pageobj.setPageText('{{subst:rfd|' + (mw.config.get('wgNamespaceNumber') === 10 ? 'showontransclusion=1|' : '') + 'content=\n' + text + '\n}}');
				pageobj.setEditSummary('Đã liệt kê cho thảo luận tại [[:' + params.discussionpage + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchPage'));
				pageobj.setCreateOption('nocreate');
				pageobj.save();
			},
			todaysList: function(pageobj) {
				var old_text = pageobj.getPageText();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				// params.rfdtarget + sectionHash + "}} ~~~~\n" );
				var added_data = Twinkle.xfd.callbacks.getDiscussionWikitext('rfd', params);
				var text = old_text.replace(/(<!-- Add new entries directly below this line\.? -->)/, '$1\n' + added_data);
				if (text === old_text) {
					statelem.error('không tìm được nơi sẽ diễn ra cuộc thảo luận');
					return;
				}
	
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang thêm [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
				});
			},
			sendNotifications: function(pageobj) {
				var initialContrib = pageobj.getCreator();
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
	
				// Notifying initial contributor
				if (params.notifycreator) {
					// Disallow warning yourself
					if (initialContrib === mw.config.get('wgUserName')) {
						statelem.warn('Bạn (' + initialContrib + ') đã tạo trang này; đang bỏ qua thông báo người dùng');
					} else {
						Twinkle.xfd.callbacks.rfd.userNotification(params, initialContrib);
					}
				}
	
				// Notifying target page's watchers, if not a soft redirect
				if (params.relatedpage) {
					var targetTalk = new mw.Title(params.rfdtarget).getTalkPage();
	
					// On the offchance it's a circular redirect
					if (params.rfdtarget === mw.config.get('wgPageName')) {
						statelem.warn('Circular redirect; skipping target page notification');
					} else if (document.getElementById('softredirect')) {
						statelem.warn('Soft redirect; skipping target page notification');
					} else if (targetTalk.getNamespaceId() === 3) {
						// Don't issue if target talk is the initial contributor's talk or your own
						if (targetTalk.getNameText() === initialContrib) {
							statelem.warn('Target is initial contributor; skipping target page notification');
						} else if (targetTalk.getNameText() === mw.config.get('wgUserName')) {
							statelem.warn('You (' + mw.config.get('wgUserName') + ') are the target; skipping target page notification');
						}
					} else {
						Twinkle.xfd.callbacks.rfd.targetNotification(params, targetTalk.toText());
					}
				}
			},
			userNotification: function(params, initialContrib) {
				var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Notifying initial contributor (' + initialContrib + ')');
				var notifytext = '\n{{subst:Rfd notice|1=' + Morebits.pageNameNorm + '}} ~~~~';
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Notification: [[' + params.discussionpage + '|listing]] of [[:' + Morebits.pageNameNorm + ']] at [[WP:RFD|redirects for discussion]].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(usertalkpage, Twinkle.getPref('xfdWatchUser'));
				usertalkpage.setFollowRedirect(true, false);
				usertalkpage.append(function onNotifySuccess() {
					// add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, initialContrib);
				}, function onNotifyError() {
					// if user could not be notified, log nomination without mentioning that notification was sent
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
			},
			targetNotification: function(params, targetTalk) {
				var targettalkpage = new Morebits.wiki.page(targetTalk, 'Notifying redirect target of the discussion');
				var notifytext = '\n{{subst:Rfd notice|1=' + Morebits.pageNameNorm + '}} ~~~~';
				targettalkpage.setAppendText(notifytext);
				targettalkpage.setEditSummary('Notification: [[' + params.discussionpage + '|listing]] of [[:' + Morebits.pageNameNorm + ']] at [[WP:RFD|redirects for discussion]].');
				targettalkpage.setChangeTags(Twinkle.changeTags);
				targettalkpage.setCreateOption('recreate');
				Twinkle.xfd.setWatchPref(targettalkpage, Twinkle.getPref('xfdWatchRelated'));
				targettalkpage.setFollowRedirect(true);
				targettalkpage.append(function() {
					// Add to userspace log if not notifying the creator
					if (!params.notifycreator) {
						Twinkle.xfd.callbacks.addToLog(params, null);
					}
				});
	
			}
		},
	
		rm: {
			listAtTalk: function(pageobj) {
				var params = pageobj.getCallbackParameters();
	
				pageobj.setAppendText('\n\n' + Twinkle.xfd.callbacks.getDiscussionWikitext('rm', params));
				pageobj.setEditSummary('Đang đề xuất di chuyển' + (params.newname ? ' tới [[:' + params.newname + ']]' : ''));
				pageobj.setChangeTags(Twinkle.changeTags);
				pageobj.setCreateOption('recreate'); // since the talk page need not exist
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchDiscussion'));
				pageobj.append(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
					// add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
			},
	
			listAtRM: function(pageobj) {
			
				var text = pageobj.getPageText() + '\n';
				var params = pageobj.getCallbackParameters();
				var statelem = pageobj.getStatusElement();
							
				var de_muc_regex = new RegExp('==\\s*Chưa\\s+giải\\s+quyết\\s*==\n');		
				var de_muc_value = '==Chưa giải quyết==\n';
				var new_data = Twinkle.xfd.callbacks.getDiscussionWikitext('rm', params) + '\n';
				
				if (de_muc_regex.test(text)) { // nếu đã có đề mục tương ứng
					statelem.info('Đã tìm thấy phần để thêm, đang tiến hành thêm mục mới');
					text = text.replace(de_muc_regex, de_muc_value + new_data);
				} 
				else { // nếu cần tạo phần mới
					statelem.info('Không tìm thấy phần nào để thêm, đang tiếp tục tạo phần mới');
					text = text.replace('<!-- Xin đừng rời phần đầu này. Cảm ơn -->', '<!-- Xin đừng rời phần đầu này. Cảm ơn -->\n' + de_muc_value + new_data);
				}
				
				pageobj.setPageText(text);
				pageobj.setEditSummary('Đang thêm [[:' + Morebits.pageNameNorm + ']].');
				pageobj.setChangeTags(Twinkle.changeTags);
				Twinkle.xfd.setWatchPref(pageobj, Twinkle.getPref('xfdWatchList'));
				pageobj.setCreateOption('recreate');
				pageobj.save(function() {
					Twinkle.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
					// add this nomination to the user's userspace log
					Twinkle.xfd.callbacks.addToLog(params, null);
				});
	
			}
		}
	};
	
	
	
	Twinkle.xfd.callback.evaluate = function(e) {
		var form = e.target;
	
		var params = Morebits.quickForm.getInputData(form);
	
		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);
	
		Twinkle.xfd.currentRationale = params.reason;
		Morebits.status.onError(Twinkle.xfd.printRationale);
	
		var query, wikipedia_page, wikipedia_api;
		var date = new Morebits.date(); // XXX: avoid use of client clock, still used by TfD, FfD and CfD
		switch (params.venue) {
	
			case 'afd': // AFD
				query = {
					'action': 'query',
					'list': 'allpages',
					'apprefix': 'Biểu quyết xoá bài/' + Morebits.pageNameNorm,
					'apnamespace': 4,
					'apfilterredir': 'nonredirects',
					'aplimit': 'max' // 500 is max for normal users, 5000 for bots and sysops
				};
				wikipedia_api = new Morebits.wiki.api('Đang gắn thẻ bài viết bằng thẻ xóa', query, Twinkle.xfd.callbacks.afd.main);
				wikipedia_api.params = params;
				wikipedia_api.post();
				break;
	
			case 'tfd': // TFD
				Morebits.wiki.addCheckpoint();
				if (params.tfdtarget) { // remove namespace name
					params.tfdtarget = utils.stripNs(params.tfdtarget);
				}
	
				params.logpage = 'Wikipedia:Templates for discussion/Log/' + date.format('YYYY MMMM D', 'utc'),
				params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;
	
				// Modules can't be tagged, TfD instructions are to place
				// on /doc subpage, so need to tag and watch specially
				params.scribunto = mw.config.get('wgPageContentModel') === 'Scribunto';
				var watch_query = {
					action: 'watch',
					titles: [ mw.config.get('wgPageName') ],
					token: mw.user.tokens.get('watchToken')
				};
				// Tagging template(s)/module(s)
				if (params.xfdcat === 'tfm') { // Merge
					var wikipedia_otherpage;
	
					// Tag this template/module
					if (params.scribunto) {
						wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName') + '/doc', 'Đang gắn thẻ tài liệu mô-đun này bằng thẻ hợp nhất');
						params.otherTemplateName = 'Module:' + params.tfdtarget;
						wikipedia_otherpage = new Morebits.wiki.page(params.otherTemplateName + '/doc', 'Đang gắn thẻ tài liệu mô-đun khác bằng thẻ hợp nhất');
	
						// Watch tagged module pages as well
						if (Twinkle.getPref('xfdWatchPage') !== 'no') {
							watch_query.titles.push(params.otherTemplateName);
							new Morebits.wiki.api('Adding Modules to watchlist', watch_query).post();
						}
					} else {
						wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Đang gắn bản mẫu này bằng thẻ hợp nhất');
						params.otherTemplateName = 'Template:' + params.tfdtarget;
						wikipedia_otherpage = new Morebits.wiki.page(params.otherTemplateName, 'Đang gắn bản mẫu khác bằng thẻ hợp nhất');
					}
					wikipedia_page.setFollowRedirect(true);
					wikipedia_page.setCallbackParameters(params);
					wikipedia_page.load(Twinkle.xfd.callbacks.tfd.taggingTemplateForMerge);
	
					// Tag other template/module
					wikipedia_otherpage.setFollowRedirect(true);
					var otherParams = $.extend({}, params);
					otherParams.otherTemplateName = Morebits.pageNameNorm;
					wikipedia_otherpage.setCallbackParameters(otherParams);
					wikipedia_otherpage.load(Twinkle.xfd.callbacks.tfd.taggingTemplateForMerge);
				} else { // delete
					if (params.scribunto) {
						wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName') + '/doc', 'Tagging module documentation with deletion tag');
	
						// Watch tagged module page as well
						if (Twinkle.getPref('xfdWatchPage') !== 'no') {
							new Morebits.wiki.api('Adding Module to watchlist', watch_query).post();
						}
					} else {
						wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Tagging template with deletion tag');
					}
					wikipedia_page.setFollowRedirect(true);  // should never be needed, but if the page is moved, we would want to follow the redirect
					wikipedia_page.setCallbackParameters(params);
					wikipedia_page.load(Twinkle.xfd.callbacks.tfd.taggingTemplate);
				}
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = params.logpage;
				Morebits.wiki.actionCompleted.notice = "Nomination completed, now redirecting to today's log";
	
				// Adding discussion
				wikipedia_page = new Morebits.wiki.page(params.logpage, "Adding discussion to today's log");
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.tfd.todaysList);
	
				// Notification to first contributors
				if (params.notifycreator) {
					var involvedpages = [];
					var seenusers = [];
					involvedpages.push(new Morebits.wiki.page(mw.config.get('wgPageName')));
					if (params.xfdcat === 'tfm') {
						if (params.scribunto) {
							involvedpages.push(new Morebits.wiki.page('Module:' + params.tfdtarget));
						} else {
							involvedpages.push(new Morebits.wiki.page('Template:' + params.tfdtarget));
						}
					}
					involvedpages.forEach(function(page) {
						page.setCallbackParameters(params);
						page.lookupCreation(function(innerpage) {
							var username = innerpage.getCreator();
							if (seenusers.indexOf(username) === -1) {
								seenusers.push(username);
								Twinkle.xfd.callbacks.tfd.userNotification(innerpage);
							}
						});
					});
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(params, null);
				}
	
				Morebits.wiki.removeCheckpoint();
				break;
	
			case 'mfd': // MFD
				query = {
					'action': 'query',
					'list': 'allpages',
					'apprefix': 'Miscellany for deletion/' + Morebits.pageNameNorm,
					'apnamespace': 4,
					'apfilterredir': 'nonredirects',
					'aplimit': 'max' // 500 is max for normal users, 5000 for bots and sysops
				};
				wikipedia_api = new Morebits.wiki.api('Looking for prior nominations of this page', query, Twinkle.xfd.callbacks.mfd.main);
				wikipedia_api.params = params;
				wikipedia_api.post();
				break;
	
			case 'ffd': // FFD
				params.date = date.format('YYYY MMMM D', 'utc');
				//params.logpage = 'Wikipedia:Biểu quyết xoá tập tin/' + params.date
				params.logpage = 'Wikipedia:Biểu quyết xoá tập tin';
				params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;
	
				Morebits.wiki.addCheckpoint();
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = params.logpage;
				Morebits.wiki.actionCompleted.notice = 'Đề cử đã hoàn tất, hiện đang chuyển hướng đến trang thảo luận';
	
				// Tagging file
				wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Đang thêm thẻ xóa vào trang tập tin');
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.ffd.taggingImage);
	
				// Contributor specific edits
				wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'));
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.lookupCreation(Twinkle.xfd.callbacks.ffd.main);
	
				Morebits.wiki.removeCheckpoint();
				break;
	
			case 'cfd':
				Morebits.wiki.addCheckpoint();
	
				if (params.cfdtarget) {
					params.cfdtarget = utils.stripNs(params.cfdtarget);
				} else {
					params.cfdtarget = '';
				}
				if (params.cfdtarget2) {
					params.cfdtarget2 = utils.stripNs(params.cfdtarget2);
				}
	
				params.logpage = 'Wikipedia:Categories for discussion/Log/' + date.format('YYYY MMMM D', 'utc');
				params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;
	
				// Useful for customized actions in edit summaries and the notification template
				var summaryActions = {
					cfd: 'deletion',
					'sfd-t': 'deletion',
					cfm: 'merging',
					cfr: 'renaming',
					'sfr-t': 'renaming',
					cfs: 'splitting',
					cfc: 'conversion'
				};
				params.action = summaryActions[params.xfdcat];
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = params.logpage;
				Morebits.wiki.actionCompleted.notice = "Nomination completed, now redirecting to today's log";
	
				// Tagging category
				wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Tagging category with ' + params.action + ' tag');
				wikipedia_page.setFollowRedirect(true); // should never be needed, but if the page is moved, we would want to follow the redirect
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.cfd.taggingCategory);
	
				// Adding discussion to list
				wikipedia_page = new Morebits.wiki.page(params.logpage, "Adding discussion to today's list");
				wikipedia_page.setPageSection(2);
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.cfd.todaysList);
	
				// Notification to first contributor
				if (params.notifycreator) {
					wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'));
					wikipedia_page.setCallbackParameters(params);
					wikipedia_page.lookupCreation(Twinkle.xfd.callbacks.cfd.userNotification);
				// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
				} else {
					Twinkle.xfd.callbacks.addToLog(params, null);
				}
	
				Morebits.wiki.removeCheckpoint();
				break;
	
			case 'cfds':
				// add namespace name if missing
				params.cfdstarget = utils.addNs(params.cfdstarget, 14);
	
				var logpage = 'Wikipedia:Categories for discussion/Speedy';
	
				// Updating data for the action completed event
				Morebits.wiki.actionCompleted.redirect = logpage;
				Morebits.wiki.actionCompleted.notice = 'Nomination completed, now redirecting to the discussion page';
	
				// Tagging category
				wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Tagging category with rename tag');
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.cfds.taggingCategory);
	
				// Adding discussion to list
				wikipedia_page = new Morebits.wiki.page(logpage, 'Đang thêm thảo luận vào danh sách');
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.xfd.callbacks.cfds.addToList);
	
				break;
	
			case 'rfd':
				// find target and pass main as the callback
				Twinkle.xfd.callbacks.rfd.findTarget(params, Twinkle.xfd.callbacks.rfd.main);
				break;
	
			case 'rm':
				var nomPageName = 'Wikipedia:Yêu cầu di chuyển trang';
				wikipedia_page = new Morebits.wiki.page(nomPageName, 'Đang thêm mục ở Wikipedia:Yêu cầu di chuyển trang');
				wikipedia_page.setFollowRedirect(true);
				wikipedia_page.setCallbackParameters(params);
				
				wikipedia_page.load(Twinkle.xfd.callbacks.rm.listAtRM);
				
				Morebits.wiki.actionCompleted.redirect = nomPageName;
				Morebits.wiki.actionCompleted.notice = 'Đề cử đã hoàn tất, hiện đang chuyển hướng đến trang thảo luận';
				
	
				break;
	
			default:
				alert('twinklexfd: địa điểm thảo luận xóa không xác định');
				break;
		}
	};
	
	Twinkle.addInitCallback(Twinkle.xfd, 'xfd');
	})(jQuery);
	
	
	// </nowiki>
	